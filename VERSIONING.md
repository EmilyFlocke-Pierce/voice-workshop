# Versioning

Note: matrix versioning may be updated by the crew's versioning fix. When it lands, change this file to match.

## Branches and releases

- The primary branch is `main`.
- Work happens on a local branch. Emily merges to `main`, and nothing merges until she says.
- App versions use semver, tagged `vX.Y.Z` on `main` when Emily merges. The app version lives in `app/package.json`.
- Every version gets an entry in `CHANGELOG.md`, written when the version is tagged.

## Matrices

- Each slice matrix carries a version number.
- Criteria stay as written. The build meets each row on every honest reading.
- A 🦋 in FLAGS.md is a take in writing: what the locators found, how the builder reads the row, what the build does to meet it as written, and why. CANDY, the locators, or Emily can answer with how they saw it.
- The matrix version changes only through a builder note and a recut that Emily co-signs, and only if a row is really bad.
- Record a recut in the matrix's history section (the "Matrix history" heading in the slice folder's README.md) and in FLAGS.md.
- Plans and manifests name the matrix version they built or located against.
- Call them matrices, and name the matrix in plain words wherever it appears.
