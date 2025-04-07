# Branching Strategy: Minimalist SEO Report Generator

## Branch Structure

```
main
  └── develop
       ├── feature/landing-page
       ├── feature/form-validation
       ├── feature/api-setup
       ├── feature/seo-analysis
       ├── feature/pdf-generation
       ├── feature/email-delivery
       └── feature/database-integration
```

## Branch Types and Purposes

### Main Branches

1. **main**
   - Production-ready code
   - Contains stable, tested code
   - Deployed to production environment
   - Tagged with version numbers for releases
   - Protected branch: requires pull request and approval

2. **develop**
   - Integration branch
   - Contains features ready for testing
   - Used for integration testing
   - Deployed to staging/development environment
   - Protected branch: requires pull request

### Supporting Branches

3. **feature/***
   - Purpose: Development of new features
   - Created from: `develop`
   - Merged back to: `develop`
   - Naming convention: `feature/feature-name`
   - Example: `feature/landing-page`, `feature/form-validation`

4. **bugfix/***
   - Purpose: Fixing non-critical bugs in development
   - Created from: `develop`
   - Merged back to: `develop`
   - Naming convention: `bugfix/bug-description`
   - Example: `bugfix/form-submission-error`

5. **hotfix/***
   - Purpose: Fixing critical bugs in production
   - Created from: `main`
   - Merged back to: `main` AND `develop`
   - Naming convention: `hotfix/bug-description`
   - Example: `hotfix/security-vulnerability`

## Workflow Rules

### Feature Development

1. Create feature branch from `develop`:
   ```
   git checkout develop
   git pull
   git checkout -b feature/feature-name
   ```

2. Develop and test the feature in isolation

3. Commit changes with descriptive messages:
   ```
   git commit -m "feat: add form validation for URL field"
   ```

4. Push to remote repository:
   ```
   git push -u origin feature/feature-name
   ```

5. Create pull request to merge into `develop`

6. After code review and approval, merge to `develop`

### Bug Fixes

1. Create bugfix branch from `develop`:
   ```
   git checkout develop
   git pull
   git checkout -b bugfix/bug-description
   ```

2. Fix the bug and test

3. Follow same commit, push, and PR process as features

### Hotfixes

1. Create hotfix branch from `main`:
   ```
   git checkout main
   git pull
   git checkout -b hotfix/bug-description
   ```

2. Fix the critical bug and test

3. Create PR to merge into `main`

4. After merge to `main`, also merge to `develop`:
   ```
   git checkout develop
   git pull
   git merge main
   git push
   ```

### Releases

1. When `develop` is ready for release, create PR to merge into `main`

2. After thorough testing and approval, merge to `main`

3. Tag the release:
   ```
   git checkout main
   git pull
   git tag -a v1.0.0 -m "Version 1.0.0"
   git push origin v1.0.0
   ```

## Commit Message Convention

Follow conventional commits format:

- `feat:` - A new feature
- `fix:` - A bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code changes that neither fix bugs nor add features
- `test:` - Adding or modifying tests
- `chore:` - Changes to build process or auxiliary tools

Example:
```
feat: add SEO analysis component
fix: correct form validation error
docs: update API documentation
```

## Note

This branching strategy will be strictly followed throughout the project implementation. Any deviation must be discussed and documented. 