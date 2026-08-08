# Secure release procedure

## npm trusted publishing

Production releases use npm trusted publishing with GitHub Actions OIDC. Configure
the `react-helmet-pro` package on npm with this trusted publisher:

- provider: GitHub Actions
- organization: `opencorex-org`
- repository: `react-helmet-pro`
- workflow: `publish.yml`
- environment: `npm`
- allowed action: `npm publish`

The npm environment should require maintainer approval. After the trusted
publisher succeeds, set npm publishing access to require two-factor
authentication and disallow tokens, then revoke the former `NPM_TOKEN`.

The release workflow requires Node.js 24 and npm 12.0.1 or newer. It verifies
that the pushed tag is exactly `v<package.json version>`, resolves to the
workflow commit, and is reachable from `main`. It then builds, packs, inspects,
installs, and imports the exact tarball before publishing that same file. npm
records an OIDC-backed provenance attestation in the public transparency log.

After a new version reaches `main`, `tag-version.yml` creates the matching tag
and GitHub Release, then explicitly dispatches `publish.yml` with that tag. The
explicit dispatch is required because GitHub does not start another workflow
from a tag pushed with the repository `GITHUB_TOKEN`. Direct tag pushes remain
supported, and maintainers can manually dispatch `publish.yml` with an existing
release tag to recover from a failed dispatch. All entry points run the same
release identity checks before publishing.

Consumers can verify registry signatures and provenance attestations in an
installed project with:

```sh
npm audit signatures
```

## Token fallback

If npm trusted publishing is unavailable, do not add an npm token to the GitHub
Actions workflow. A maintainer may download the verified workflow artifact and
publish it from a trusted workstation with a short-lived, granular npm token:

```sh
npm publish react-helmet-pro-<version>.tgz --access public --provenance
```

Revoke the token immediately after publishing and record why the fallback was
required. Restore OIDC publishing before the next automated release.

## Rollback

Published npm versions are immutable and release tags must never be moved. If a
release is faulty but does not meet npm's unpublish-policy requirements:

1. Deprecate the affected version with a clear replacement message.
2. Revert the faulty commit on `main`.
3. Increment the package version and publish a corrected release normally.
4. Update the GitHub release notes with the impact and replacement version.

Use `npm unpublish` only when npm policy permits it and removal is necessary for
security or legal reasons. Never reuse the removed version number or retag a
different commit with the same tag.
