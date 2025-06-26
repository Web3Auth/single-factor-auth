import toruslabsTypescript from "@toruslabs/eslint-config-typescript";

export default [
    ...toruslabsTypescript,
    {
        rules: {
            "prefer-arrow-callback": "off",
            "func-names": "off"
        }
    }
];