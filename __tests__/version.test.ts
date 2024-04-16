/* eslint-disable @typescript-eslint/no-floating-promises */
import { contextFromEnvironment, generateVersion } from '../src/version'

describe(`generateVersion`, () => {
  const defaultContext = {
    ci: true,
    buildNumber: 34,
    tag: undefined,
    branch: undefined
  }

  it(`should use local suffix when not in CI`, () => {
    const context = {
      ...defaultContext,
      ci: false
    }
    expect(generateVersion('1.2.3-foo', context)).toEqual({
      version: '1.2.3-local'
    })
  })

  it(`should use tag when tag specified`, () => {
    const context = {
      ...defaultContext,
      tag: '3.2.1'
    }
    expect(generateVersion('1.0.0-local', context)).toEqual({
      version: '3.2.1'
    })
  })

  it(`should strip the v prefix from tags`, () => {
    const context = {
      ...defaultContext,
      tag: 'v3.2.1'
    }
    expect(generateVersion('1.0.0-local', context)).toEqual({
      version: '3.2.1'
    })
  })

  it(`work for v1.1.1`, () => {
    const context = {
      ...defaultContext,
      tag: 'v1.1.1'
    }
    expect(generateVersion('1.0.0-local', context)).toEqual({
      version: '1.1.1'
    })
  })

  it(`should error for non-semver tag`, () => {
    const context = {
      ...defaultContext,
      tag: 'wibble'
    }
    expect(generateVersion('1.0.0-local', context)).toEqual({
      error: 'Invalid semver tag: wibble'
    })
  })

  it(`should use the build number for branches`, () => {
    const context = {
      ...defaultContext,
      branch: 'wobble'
    }
    expect(generateVersion('1.0.0-local', context)).toEqual({
      version: '1.0.0-wobble.34'
    })
  })

  // Assumption is that you only use one of these for versioned builds.
  for (const usesDev of ['master', 'main', 'develop']) {
    it(`should use dev for ${usesDev}`, () => {
      const context = {
        ...defaultContext,
        branch: usesDev
      }
      expect(generateVersion('1.0.0-local', context)).toEqual({
        version: '1.0.0-dev.34'
      })
    })
  }

  it(`should error if no branch or tag`, () => {
    expect(generateVersion('1.0.0-local', defaultContext)).toEqual({
      error: 'Could not determine a version. CI environment invalid?'
    })
  })

  it(`should sanitise branch names`, () => {
    const context = {
      ...defaultContext,
      branch: 'feature/£-foo-bar\\blort-1234.99'
    }
    expect(generateVersion('1.0.0-local', context)).toEqual({
      version: '1.0.0-feature.foo.bar.blort.1234.99.34'
    })
  })

  it(`should use dot separated components as per semver`, () => {
    const context = {
      ...defaultContext,
      branch: 'feature/my-fave-feature'
    }
    expect(generateVersion('1.0.0-local', context)).toEqual({
      version: '1.0.0-feature.my.fave.feature.34'
    })
  })

  it(`treat underscores as separators`, () => {
    const context = {
      ...defaultContext,
      branch: 'foo_bar'
    }
    expect(generateVersion('1.0.0-local', context)).toEqual({
      version: '1.0.0-foo.bar.34'
    })
  })

  it(`should use a placeholder if the branch is sanitized away`, () => {
    const context = {
      ...defaultContext,
      branch: '---'
    }
    expect(generateVersion('1.0.0-local', context)).toEqual({
      version: '1.0.0-branch.34'
    })
  })
})

describe('contextFromEnvironment', () => {
  it('works for GitHub actions branch case', () => {
    expect(
      contextFromEnvironment({
        GITHUB_ACTION: 'lala',
        CI: 'true',
        GITHUB_REF: 'refs/heads/asdf',
        GITHUB_RUN_NUMBER: '12'
      })
    ).toEqual({
      branch: 'asdf',
      buildNumber: 12,
      ci: true,
      tag: undefined
    })
  })
  it('works for GitHub actions tag case', () => {
    expect(
      contextFromEnvironment({
        GITHUB_ACTION: 'lala',
        CI: 'true',
        GITHUB_REF: 'refs/tags/asdf',
        GITHUB_RUN_NUMBER: '12'
      })
    ).toEqual({
      branch: undefined,
      buildNumber: 12,
      ci: true,
      tag: 'asdf'
    })
  })
  it('works for GitHub actions tag case numeric', () => {
    expect(
      contextFromEnvironment({
        GITHUB_ACTION: 'lala',
        CI: 'true',
        GITHUB_REF: 'refs/tags/v1.1.1',
        GITHUB_RUN_NUMBER: '12'
      })
    ).toEqual({
      branch: undefined,
      buildNumber: 12,
      ci: true,
      tag: 'v1.1.1'
    })
  })
})
