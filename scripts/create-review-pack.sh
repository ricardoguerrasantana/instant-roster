#!/usr/bin/env bash

set -Eeuo pipefail
IFS=$'\n\t'
umask 077

readonly base_ref='origin/main'

die() {
  printf 'Error: %s\n' "$1" >&2
  exit 1
}

usage() {
  printf 'Usage: bash scripts/create-review-pack.sh <feature-slug>\n' >&2
  printf 'Example: bash scripts/create-review-pack.sh employees\n' >&2
}

is_sensitive_path() {
  local candidate_path="$1"
  local lower_path
  local path_basename

  lower_path="$(printf '%s' "$candidate_path" | tr '[:upper:]' '[:lower:]')"
  path_basename="${lower_path##*/}"

  case "/${lower_path}/" in
    */node_modules/* | */.vercel/* | */supabase/.temp/* | */supabase/.branches/* | */.docker/config.json/*)
      return 0
      ;;
  esac

  case "$path_basename" in
    .env.example)
      return 1
      ;;
    .env* | .npmrc | .netrc | .pypirc | .yarnrc | *.pem | *.key | *.p8 | *.p12 | *.pfx | *.jks)
      return 0
      ;;
    id_rsa | id_dsa | id_ecdsa | id_ed25519 | *credential* | *private*key* | service-account*.json)
      return 0
      ;;
  esac

  return 1
}

contains_suspected_secret() {
  local candidate_file="$1"
  local known_secret_pattern
  local literal_assignment_pattern
  local safe_reference_pattern
  local safe_reference_replacement
  local unquoted_assignment_pattern

  known_secret_pattern="-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----|AKIA[0-9A-Z]{16}|gh[pousr]_[[:alnum:]]{20,}|npm_[[:alnum:]_-]{20,}|sk-[[:alnum:]_-]{20,}|sb_secret_[[:alnum:]_-]{16,}|xox[baprs]-[[:alnum:]-]{20,}|eyJ[[:alnum:]_-]{20,}\\.eyJ[[:alnum:]_-]{20,}\\.[[:alnum:]_-]{16,}|(SUPABASE_URL|NEXT_PUBLIC_SUPABASE_URL)[[:space:]]*=[[:space:]]*['\"]?https?://|(postgres(ql)?|mysql|mariadb|mongodb(\\+srv)?|redis|rediss|amqp|amqps|https?|ftp)://[^[:space:]/:@]+:[^[:space:]@]+@"
  literal_assignment_pattern="['\"]?(password|passwd|client[_-]?secret|api[_-]?key|auth[_-]?token|access[_-]?token|refresh[_-]?token|service[_-]?role[_-]?key|private[_-]?key|supabase[_-]?anon[_-]?key)['\"]?[[:space:]]*[:=][[:space:]]*['\"][^'\"<[:cntrl:]]{4,}['\"]"
  unquoted_assignment_pattern="['\"]?(password|passwd|client[_-]?secret|api[_-]?key|auth[_-]?token|access[_-]?token|refresh[_-]?token|service[_-]?role[_-]?key|private[_-]?key|supabase[_-]?anon[_-]?key)['\"]?[[:space:]]*[:=][[:space:]]*[[:alnum:]_+/@.-]{8,}([[:space:]]*[,;}]|[[:space:]]*(#.*)?\$)"
  safe_reference_pattern="[=:][[:space:]]*(['\"]?env\\([A-Z0-9_]+\\)['\"]?|process\\.env\\.[A-Z0-9_]+|import\\.meta\\.env\\.[A-Z0-9_]+|['\"]?[$]\\{?[A-Z][A-Z0-9_]*\\}?['\"]?)"
  safe_reference_replacement='= "<SAFE_ENV_REFERENCE>"'

  if LC_ALL=C grep -aEiq -- "$known_secret_pattern" "$candidate_file"; then
    return 0
  fi

  if LC_ALL=C sed -E "s~${safe_reference_pattern}~${safe_reference_replacement}~g" "$candidate_file" \
    | LC_ALL=C grep -aEi -- "${literal_assignment_pattern}|${unquoted_assignment_pattern}" >/dev/null;
  then
    return 0
  fi

  return 1
}

scan_git_blob() {
  local revision="$1"
  local changed_path="$2"
  local object_type

  if ! object_type="$(git cat-file -t "${revision}:${changed_path}" 2>/dev/null)"; then
    return 0
  fi
  if [[ "$object_type" != 'blob' ]]; then
    return 0
  fi

  git cat-file blob "${revision}:${changed_path}" > "$temporary_blob"
  if contains_suspected_secret "$temporary_blob"; then
    die 'A committed file may contain secret material; no package was created.'
  fi
}

scan_git_object() {
  local object_id="$1"
  local object_type

  object_type="$(git cat-file -t "$object_id")"
  case "$object_type" in
    blob | commit | tag)
      git cat-file "$object_type" "$object_id" > "$temporary_blob"
      if contains_suspected_secret "$temporary_blob"; then
        die 'Feature commit history may contain secret material; no package was created.'
      fi
      ;;
  esac
}

if [[ "$#" -ne 1 ]]; then
  usage
  exit 2
fi

readonly feature_slug="$1"
if [[ ! "$feature_slug" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
  die 'Feature slug must contain lowercase letters or numbers separated by single hyphens.'
fi

if ! repository_root="$(git rev-parse --show-toplevel 2>/dev/null)"; then
  die 'Run this command from inside the Instant Roster Git repository.'
fi
readonly repository_root
cd "$repository_root"

if ! current_branch="$(git symbolic-ref --quiet --short HEAD)"; then
  die 'A named feature branch is required; detached HEAD is not supported.'
fi
readonly current_branch
if [[ "$current_branch" == 'main' ]]; then
  die 'Review packages cannot be created from main. Switch to a feature branch.'
fi

readonly report_path="/tmp/instant-roster-${feature_slug}-review.md"
readonly patch_path="/tmp/instant-roster-${feature_slug}.patch"
if [[ -L "$report_path" || -L "$patch_path" ]]; then
  die 'A requested output path is a symbolic link; remove it manually and retry.'
fi
rm -f -- "$report_path" "$patch_path"

printf 'Fetching origin/main...\n'
if ! git fetch --quiet --no-tags origin main >/dev/null 2>&1; then
  die 'Unable to fetch origin/main. Check repository access and try again.'
fi
git rev-parse --verify "${base_ref}^{commit}" >/dev/null 2>&1 \
  || die 'origin/main is not available after fetch.'

readonly feature_document="docs/features/${feature_slug}.md"
if [[ ! -f "$feature_document" ]]; then
  die "Feature document is missing: ${feature_document}"
fi
if [[ -L "$feature_document" ]]; then
  die 'The feature document must be a regular file, not a symbolic link.'
fi

if contains_suspected_secret "$feature_document"; then
  die 'The feature document may contain secret material; no package was created.'
fi

if ! base_commit="$(git merge-base "$base_ref" HEAD)"; then
  die 'Unable to determine the merge base with origin/main.'
fi
readonly base_commit

temporary_report="$(mktemp '/tmp/instant-roster-review.XXXXXX')"
temporary_patch="$(mktemp '/tmp/instant-roster-patch.XXXXXX')"
temporary_paths="$(mktemp '/tmp/instant-roster-paths.XXXXXX')"
temporary_validation="$(mktemp '/tmp/instant-roster-validation.XXXXXX')"
temporary_blob="$(mktemp '/tmp/instant-roster-blob.XXXXXX')"
temporary_raw_patch="$(mktemp '/tmp/instant-roster-raw-patch.XXXXXX')"

cleanup() {
  [[ -z "${temporary_report:-}" ]] || rm -f -- "$temporary_report"
  [[ -z "${temporary_patch:-}" ]] || rm -f -- "$temporary_patch"
  [[ -z "${temporary_paths:-}" ]] || rm -f -- "$temporary_paths"
  [[ -z "${temporary_validation:-}" ]] || rm -f -- "$temporary_validation"
  [[ -z "${temporary_blob:-}" ]] || rm -f -- "$temporary_blob"
  [[ -z "${temporary_raw_patch:-}" ]] || rm -f -- "$temporary_raw_patch"
}
trap cleanup EXIT

{
  git diff --name-only -z --no-renames origin/main...HEAD
  git diff --name-only -z --no-renames
  git diff --cached --name-only -z --no-renames
  git ls-files --others --exclude-standard -z
} > "$temporary_paths"

while IFS= read -r -d '' changed_path; do
  if is_sensitive_path "$changed_path"; then
    die 'A changed path matches a prohibited secret or generated-file category; no package was created.'
  fi
done < "$temporary_paths"

git log -m --format= --name-only -z --no-renames "${base_commit}..HEAD" > "$temporary_paths"
while IFS= read -r -d '' changed_path; do
  if [[ -n "$changed_path" ]] && is_sensitive_path "$changed_path"; then
    die 'Feature commit history contains a prohibited path; no package was created.'
  fi
done < "$temporary_paths"

git rev-list --objects --no-object-names "${base_commit}..HEAD" > "$temporary_paths"
while IFS= read -r object_id; do
  if [[ -n "$object_id" ]]; then
    scan_git_object "$object_id"
  fi
done < "$temporary_paths"

git diff --name-only -z --no-renames origin/main...HEAD > "$temporary_paths"
while IFS= read -r -d '' changed_path; do
  scan_git_blob "$base_commit" "$changed_path"
  scan_git_blob 'HEAD' "$changed_path"
done < "$temporary_paths"

if [[ -n "$(git status --porcelain=v1 --untracked-files=all)" ]]; then
  printf 'Warning: the working tree is dirty. Uncommitted changes are not included in the patch.\n' >&2
  working_tree_warning='DIRTY — inspect Git status below; the patch contains committed changes only.'
else
  working_tree_warning='Clean.'
fi
readonly working_tree_warning

git diff --binary origin/main...HEAD > "$temporary_patch"
git diff --binary --no-ext-diff --no-textconv origin/main...HEAD > "$temporary_raw_patch"
if ! cmp -s "$temporary_patch" "$temporary_raw_patch"; then
  die 'A Git external diff or textconv driver altered the patch; disable it and retry so the package remains applyable.'
fi
if contains_suspected_secret "$temporary_patch"; then
  die 'The committed patch may contain secret material; no package was created.'
fi

feature_commits="$(git log --reverse --format='- `%h` %s' origin/main..HEAD)"
if [[ -z "$feature_commits" ]]; then
  feature_commits='- None; HEAD currently matches origin/main.'
fi
readonly feature_commits

git_status="$(git status --short --branch --untracked-files=all)"
changed_files="$(git diff --name-status --no-renames origin/main...HEAD)"
if [[ -z "$changed_files" ]]; then
  changed_files='(No committed files differ from origin/main.)'
fi
diff_statistics="$(git diff --stat origin/main...HEAD)"
if [[ -z "$diff_statistics" ]]; then
  diff_statistics='(No committed diff statistics are available.)'
fi

if git diff --check origin/main...HEAD >/dev/null; then
  committed_diff_check='PASS — git diff --check origin/main...HEAD'
else
  committed_diff_check='FAIL — git diff --check origin/main...HEAD'
fi
readonly committed_diff_check

awk '
  $0 == "## Test matrix" || $0 == "## Manual validation" { include = 1 }
  /^## / && $0 != "## Test matrix" && $0 != "## Manual validation" { include = 0 }
  include { print }
' "$feature_document" > "$temporary_validation"

{
  printf '# Instant Roster review package: %s\n\n' "$feature_slug"
  printf -- '- Current branch: `%s`\n' "$current_branch"
  printf -- '- Base reference: `%s`\n' "$base_ref"
  printf -- '- Base commit: `%s`\n' "$base_commit"
  printf -- '- Working tree: %s\n\n' "$working_tree_warning"

  printf '## Feature commits\n\n%s\n\n' "$feature_commits"

  printf '## Git status\n\n```text\n%s\n```\n\n' "$git_status"

  printf '## Changed files\n\n```text\n%s\n```\n\n' "$changed_files"

  printf '## Diff statistics\n\n```text\n%s\n```\n\n' "$diff_statistics"

  printf '## Latest validation results when available\n\n'
  printf -- '- %s\n\n' "$committed_diff_check"
  if [[ -s "$temporary_validation" ]]; then
    printf 'The following results are recorded in the current feature document:\n\n'
    sed 's/^/    /' "$temporary_validation"
    printf '\n'
  else
    printf 'No test matrix or manual-validation section was found in the feature document.\n\n'
  fi

  printf '## Feature document\n\n'
  printf 'Current working-tree contents of `%s`:\n\n' "$feature_document"
  sed 's/^/    /' "$feature_document"
  printf '\n\n'

  printf '## Upload instructions\n\n'
  printf '1. Upload this Markdown report and `%s` together to the independent reviewer.\n' "$patch_path"
  printf '2. Tell the reviewer the base commit is `%s` and ask for review against `origin/main`.\n' "$base_commit"
  printf '3. Do not upload environment files, `.vercel`, Supabase temporary files, credentials, repository archives, or other untracked artifacts.\n'
  printf '4. If commits or the feature document change, regenerate both files before review.\n'
} > "$temporary_report"

if contains_suspected_secret "$temporary_report"; then
  die 'The generated report may contain secret material; no package was created.'
fi

mv -f -- "$temporary_report" "$report_path"
temporary_report=''
mv -f -- "$temporary_patch" "$patch_path"
temporary_patch=''

printf 'Review package created:\n'
printf '  %s\n' "$report_path"
printf '  %s\n' "$patch_path"
printf 'Upload both files together. Do not upload environment or credential files.\n'
