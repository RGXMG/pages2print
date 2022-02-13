/*
 * @Author: RGXMG
 * @Email: rgxmg@foxmail.com
 * @Date: 2022-02-13 19:49:15
 * @LastEditTime: 2022-02-13 20:40:35
 * @LastEditors: RGXMG
 * @Description: 容器元素
 */
const containerKey = '__IS_CONTAINER_ELEMENT__';

/**
 * 创建容器元素
 * @returns
 */
function createContainerMeta() {
  return Object.create({ [containerKey]: true });
}

/**
 * 是否为容器元素
 */
function isContainerMeta(elementMeta) {
  return (
    elementMeta && elementMeta !== null && Boolean(Object.getPrototypeOf(elementMeta)[containerKey])
  );
}

export { createContainerMeta, isContainerMeta };
