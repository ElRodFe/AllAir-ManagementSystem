export const normalize = (value, regex = /_/g, replacement = "-") =>
    value ? value.toLowerCase().replace(regex, replacement) : "";