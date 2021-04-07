module.exports = {

    occurrences: function (string, subString, allowOverlapping = true) {
        string += "";
        subString += "";
        if (subString.length <= 0) return (string.length + 1);
        var n = 0,
            pos = 0,
            step = allowOverlapping ? 1 : subString.length;
        while (true) {
            pos = string.indexOf(subString, pos);
            if (pos >= 0) {
                ++n;
                pos += step;
            } else break;
        }
        return n;
    }
}