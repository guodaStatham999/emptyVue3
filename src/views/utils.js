export const getBounding = (element) => { // 获取dom元素的只读边界
    if (element instanceof HTMLElement) {
        return element.getBoundingClientRect();
    }
    return {};
};