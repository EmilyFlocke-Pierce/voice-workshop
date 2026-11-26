# Versioning

Note: matrix versioning may be updated by the crew's versioning fix. When it lands, change this file to match.

## Branches and releases

- The primary branch is `main`.
- Work happens on a local branch. Emily merges to `main`, and nothing merges until she says.
- App versions use semver, tagged `vX.Y.Z` on `main` when Emily merges. The app version lives in `app/package.json`.
- Every version gets an entry in `CHANGELOG.md`, written when the version is tagged.

## Matrices

- Each slice matrix carries a version number.
- A real find is a butterfly. A decision, a review note, or a build result triggers it. A real find bumps the matrix version.
- Bump the version through a short amendment: the row, the old wording, the new wording, and what triggered it.
- Emily co-signs the amendment before the version changes.
- Record the amendment in the matrix's history section (the "Matrix history" heading in the slice folder's README.md) and in `FLAGS.md`.
- Plans and manifests name the matrix version they built or located against.
- Call them matrices, and name the matrix in plain words wherever it appears.