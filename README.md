# dgit
A simple CLI for download git repository files.

## Install
```
sudo npm install dgit -g
```

## Usage

```
dgit owner/repo
```

```
dgit owner/repo/path
```

```
# ref is the name of the commit/branch/tag. Default: master
dgit owner/repo/path@ref
```

```
dgit owner/repo/path /downloads
```