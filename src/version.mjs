export function checkNodeVersion(version){const [major,minor]=version.split(".").map(Number);return major>22||major===22&&minor>=16;}
