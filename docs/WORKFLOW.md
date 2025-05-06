# Git Workflow

## Creating a New Feature Branch

To create a new feature branch, switch to it, and push it to the remote repository, use:

```bash
git checkout -b feature
git push -u origin feature
```

## Merging a Feature Branch into `master`

To merge a feature branch into `master`, push changes, and delete the feature branch, use:

```bash
git checkout master
git merge feature
git push origin master
git branch -d feature
git push origin --delete feature
```

## Discarding Changes and Deleting a Feature Branch

To discard all uncommitted changes, delete your current feature branch, and switch back to the `master` branch, follow these steps:

```bash
git reset --hard
git checkout master
git branch -D feature
git push origin --delete feature
```

This will:

- Permanently discard all local changes in the working directory and index
- Switch you to the master branch
- Delete your feature branch locally
- Delete the remote version of the feature branch

## Rolling Back to Last Commit

To discard all changes since the last commit while on the same branch, do this:

```bash
git reset --hard
git clean -fd
```

## Dropping All Tables in a PostgreSQL Schema

The following SQL command drops all tables in the `public` schema of a PostgreSQL database:

```sql
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT table_name FROM information_schema.tables WHERE table_schema = 'public')
    LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || r.table_name || ' CASCADE';
    END LOOP;
END $$;
```
