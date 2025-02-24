module.exports = {
    entry: './ui.js',
    output: {
        path: __dirname,
        filename: 'UI.min.js',
        library: {
            type: 'module'
        }
    },
    experiments: {
        outputModule: true
    },
    mode: "production",
};