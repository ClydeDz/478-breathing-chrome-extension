const jQ = jest.requireActual("jquery");

const get = jest.fn((path) => {
    return Promise.resolve(path);
});

const when = jest.fn((prom1, prom2, prom3, prom4) => {
    return Promise.resolve();
});

const jQuery = jQ;
jQuery.get = get;
jQuery.when = when;
exports.jQuery = jQuery;