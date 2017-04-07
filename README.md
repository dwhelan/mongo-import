# mongo-import

This repo provides a script you can use to easily import csv files into mongodb.

# Add mongo-import to your project

Add `mongo-import` to your `package.json` file as a development dependency.

```
npm install mongo-import --save-dev
```

or

```
yarn add mongo-import --dev
```

# Add import scripts to you project

If you have a single csv file to import then update your `package.json` as follows:

```
  ...

  "scripts": {
    ...

    "import": "npm run mongo-import ./tables/GeoLocation.csv GeoLocation",

    ...
  },

  ...
```

# Run the script

The script assumes that the .csv files you want to i

```
npm run mongo-import
```

or

```
yarn mongo-import
```

# License
- To be added

# Roadmap
- To be added

# Known Issues
- To be added
