import { contextFromEnvironment, generateVersion } from '../src/version.js'

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
      version: '1.2.3-local',
      distTag: 'local'
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

  it(`should return tag for prerelease tags`, () => {
    const context = {
      ...defaultContext,
      tag: 'v0.1.0-alpha.1'
    }
    expect(generateVersion('1.0.0-local', context)).toEqual({
      version: '0.1.0-alpha.1',
      distTag: 'alpha'
    })
  })

  it(`should strip app name prefix from tags`, () => {
    const context = {
      ...defaultContext,
      tag: 'www-1.2.3'
    }
    expect(generateVersion('1.0.0-local', context)).toEqual({
      version: '1.2.3'
    })
  })

  it(`should strip multi-word prefix from tags`, () => {
    const context = {
      ...defaultContext,
      tag: 'my-app-2.0.0'
    }
    expect(generateVersion('1.0.0-local', context)).toEqual({
      version: '2.0.0'
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
      version: '1.0.0-wobble.34',
      distTag: 'wobble'
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
        version: '1.0.0-dev.34',
        distTag: 'dev'
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
      version: '1.0.0-feature.foo.bar.blort.1234.99.34',
      distTag: 'feature.foo.bar.blort.1234.99'
    })
  })

  it(`should use dot separated components as per semver`, () => {
    const context = {
      ...defaultContext,
      branch: 'feature/my-cool-feature'
    }
    expect(generateVersion('1.0.0-local', context)).toEqual({
      version: '1.0.0-feature.my.cool.feature.34',
      distTag: 'feature.my.cool.feature'
    })
  })

  it(`treat underscores as separators`, () => {
    const context = {
      ...defaultContext,
      branch: 'foo_bar'
    }
    expect(generateVersion('1.0.0-local', context)).toEqual({
      version: '1.0.0-foo.bar.34',
      distTag: 'foo.bar'
    })
  })

  it(`should use a placeholder if the branch is sanitized away`, () => {
    const context = {
      ...defaultContext,
      branch: '---'
    }
    expect(generateVersion('1.0.0-local', context)).toEqual({
      version: '1.0.0-branch.34',
      distTag: 'branch'
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
  it('works for GitHub actions pull request case', () => {
    expect(
      contextFromEnvironment({
        GITHUB_ACTION: 'lala',
        CI: 'true',
        GITHUB_REF: 'refs/pull/17/merge',
        GITHUB_HEAD_REF: 'feature/my-branch',
        GITHUB_RUN_NUMBER: '12'
      })
    ).toEqual({
      branch: 'feature/my-branch',
      buildNumber: 12,
      ci: true,
      tag: undefined
    })
  })
})
