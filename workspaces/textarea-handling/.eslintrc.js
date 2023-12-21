module.exports = {
    overrides: [
        {
            files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
            plugins: ['react', 'react-hooks'],
            extends: ['plugin:react/recommended', 'plugin:react-hooks/recommended'],
            settings: {
                react: {
                    version: 'detect',
                },
            },
            rules: {
                'react-hooks/exhaustive-deps': 'error',
                'react/react-in-jsx-scope': 'off',
                'react/no-unknown-property': 'off',
            },
        },
    ],
};
