/**
 * Created with JavaScript.
 * User: RGXMG
 * Email: rickgrimes9229@gmail.com/759237309@qq.com
 * Date: 2021/8/29
 * Time: 13:19
 *
 */

/**
 * 获取页面的像素大小
 * @param height
 * @returns {string}
 */
export default function getPagePixelHeight(height) {
  const page = document.createElement("div");
  page.style.height = `${height}mm`;
  page.style.width = "100%";
  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  document.body.appendChild(iframe);
  iframe.contentDocument.body.appendChild(page);
  const pageSize =
    iframe.contentDocument.defaultView.getComputedStyle(page).height;
  document.body.removeChild(iframe);
  return pageSize.replace("px", "");
}
