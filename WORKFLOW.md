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
