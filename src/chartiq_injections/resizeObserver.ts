export const overrideResizeObserver = () => {
    CIQ.resizeObserver = function (
        element: Element,
        listener: ResizeObserverCallback,
        resizeHandle: ResizeObserver | number | null,
        timeout: number
    ) {
        if (timeout) {
            if (typeof ResizeObserver !== 'undefined') {
                if (!resizeHandle) {
                    resizeHandle = new ResizeObserver((entries: ResizeObserverEntry[], observer: ResizeObserver) => {
                        entries.forEach(() => {
                            if (element && element.clientWidth > 0) listener?.(entries, observer);
                        });
                    });
                    resizeHandle.observe(element);
                }
            } else {
                if (resizeHandle) clearInterval(resizeHandle as number);
                resizeHandle = setInterval(listener, timeout);
            }
        } else {
            if (resizeHandle) {
                if (
                    typeof ResizeObserver !== 'undefined' &&
                    typeof resizeHandle === 'object' &&
                    typeof resizeHandle.disconnect === 'function'
                ) {
                    resizeHandle.disconnect();
                } else {
                    clearInterval(resizeHandle as number);
                }
            }
            resizeHandle = null;
        }
        return resizeHandle;
    };
};
