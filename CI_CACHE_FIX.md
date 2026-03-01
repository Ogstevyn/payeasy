# CI/CD Cache Fix Summary

## Problem
The GitHub Actions workflows were failing during `actions/setup-node@v4` with the error:
```
Some specified paths were not resolved, unable to cache dependencies.
```

## Root Cause
Multiple workflows were configured with `cache-dependency-path` pointing to `./apps/web/package-lock.json` or `apps/web/package-lock.json`, but this file doesn't exist. The actual `package-lock.json` is located at the repository root.

## Solution
Updated all workflow files to use the correct path: `cache-dependency-path: package-lock.json`

## Files Modified
1. `.github/workflows/test.yml` - Fixed cache path
2. `.github/workflows/bundle-size.yml` - Fixed cache path
3. `.github/workflows/security-scanning.yml` - Fixed cache path in 4 jobs (snyk-scan, license-scan, analyze-dependencies, verify-patches)
4. `.github/workflows/performance.yml` - Fixed cache path (commented workflow)
5. `.github/workflows/lint.yml` - Added cache path (commented workflow)
6. `.github/workflows/e2e.yml` - Added cache path (commented workflow)
7. `.github/workflows/build.yml` - Fixed cache path (commented workflow)

## Result
CI pipelines will now successfully cache npm dependencies using the root-level `package-lock.json`, eliminating the path resolution error.
