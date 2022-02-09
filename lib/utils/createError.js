/**
 * Created with JavaScript.
 * User: RGXMG
 * Email: rickgrimes9229@gmail.com/759237309@qq.com
 * Date: 2021/8/29
 * Time: 14:42
 *
 */
export default function createError(isCreate, msg) {
  isCreate || console.error(msg);
  return !isCreate;
}
