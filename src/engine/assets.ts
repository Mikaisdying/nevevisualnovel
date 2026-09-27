/**
 * Quy ước đường dẫn asset (thư mục public/assets). Đổi ảnh chỉ cần thay file
 * cùng tên; định dạng raster nào cũng được miễn giữ đuôi .png ở đây hoặc sửa
 * lại hàm tương ứng.
 */
export const bgUrl = (id: string) => `/assets/bg/${id}.png`;
export const cgUrl = (id: string) => `/assets/cg/${id}.png`;
export const charUrl = (name: string, pose: string) => `/assets/char/${name}/${pose}.png`;
