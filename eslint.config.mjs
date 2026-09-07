import microbit from '@microbit/eslint-config'

export default [
  ...microbit,
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          // Files the build tsconfig excludes but we still want type-aware
          // linting for.
          allowDefaultProject: ['__tests__/*.ts', 'rollup.config.ts']
        },
        tsconfigRootDir: import.meta.dirname
      }
    }
  }
]
