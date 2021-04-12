/* eslint-disable no-plusplus */
/* eslint-disable no-param-reassign */
/* eslint-disable indent */

const sortObjKeys = (obj) => Object.keys(obj)
.sort()
.reduce((acc, curr) => {
    if (typeof obj[curr] === 'object') {
        acc[curr] = sortObjKeys(obj[curr]);
    } else {
        acc[curr] = obj[curr];
    }
    return acc;
}, {});

module.exports = {
    occurrences(string, subString, allowOverlapping = true) {
        string += '';
        subString += '';
        if (subString.length <= 0) return (string.length + 1);
        let n = 0;
        let pos = 0;
        const step = allowOverlapping ? 1 : subString.length;
        while (true) {
            pos = string.indexOf(subString, pos);
            if (pos >= 0) {
                ++n;
                pos += step;
            } else break;
        }
        return n;
    },
    sortObjKeys,
};
