export const text = jest.fn();
export const val = jest.fn(() => {return 3;});
export const hide = jest.fn();
export const show = jest.fn();
export const on = jest.fn();

export const jQuery = jest.fn(() => ({
    text,
    val,
    hide,
    show,
    on
}));
