# Codex Startup Animation — bản Windows

Bản chuyển riêng cho máy Windows từ https://github.com/panding999/codex-startup-animation, commit `c743c2b5eceaa7be9dc511d23a1a77f7c4ce6248`.

## Tải và cài đặt

Mở [Releases](https://github.com/Nuttnee/codex-startup-animation/releases/latest), tải **Codex-Startup-Windows-VI.zip** trong mục Assets. Nếu muốn đối chiếu tệp tải, tải thêm **SHA256SUMS.txt** rồi chạy `Get-FileHash .\Codex-Startup-Windows-VI.zip -Algorithm SHA256` và so sánh mã băm. Không cần cài SDK để sử dụng bản ZIP.

## Chạy

1. Giải nén toàn bộ ZIP vào một thư mục cố định; không chạy trực tiếp bên trong ZIP.
2. Lưu công việc và **thoát hẳn Codex**, kể cả biểu tượng ở khay hệ thống. Đóng cửa sổ có thể chưa thoát ứng dụng.
3. Nhấp đúp **Launch-Windows.cmd**. Animation phát khoảng 12 giây trong chính cửa sổ Codex, sau đó giữ hình nền tĩnh. Cửa sổ dòng lệnh tự đóng sau khi xác nhận animation bắt đầu.
4. **Ctrl+Alt+B**: mở cài đặt ảnh, chữ và độ đậm hình nền. **Esc**: bỏ qua animation. Giao diện, thông báo và nội dung mặc định đã được Việt hóa.

Có thể tạo shortcut của Launch-Windows.cmd trên Desktop. Không thay thế shortcut chính thức của Codex.

**Preview-Windows.cmd** mở bản xem thử bằng trình duyệt mặc định, không thay đổi Codex. Thiết lập của bản xem thử không dùng chung với ứng dụng thật.

Nếu đã dùng bản trước, hãy thoát Codex rồi chạy launcher trong thư mục bản mới. Ảnh và chữ bạn đã lưu được giữ nguyên. Muốn chuyển cả chữ mặc định cũ sang tiếng Việt, sửa các ô chữ rồi lưu; nút **Khôi phục mặc định** sẽ đặt lại cả ảnh, chữ và độ đậm.

Chỉ phần khởi động/cài đặt của tiện ích được Việt hóa; ngôn ngữ của ứng dụng Codex và hộp chọn tệp Windows do chính ứng dụng/hệ điều hành quản lý.

## Cài đặt ảnh

- Khối bên trái: avatar; khối bên phải: hình nền. Chấp nhận PNG, JPEG, WebP, tối đa 30 MB/ảnh.
- Các ô chữ: tiêu đề, dòng chữ nhỏ, phụ đề. Để trống để ẩn.
- Thanh phần trăm: độ hiện hình nền; 0% tắt hình nền.
- **Lưu và xem lại**: lưu và xem lại; **Khôi phục mặc định**: khôi phục ảnh/chữ mặc định.
- **Tắt hiệu ứng, khôi phục giao diện Codex**: gỡ lớp trang trí trong phiên hiện tại.
- Dấu × hoặc Esc khi ở hộp cài đặt: hủy thay đổi chưa lưu.

Ảnh được lưu tại máy bằng IndexedDB. Công cụ không tải ảnh của bạn lên mạng.

## Yêu cầu và cách hoạt động

- Windows với Codex desktop chính thức. Đã thử trên gói `OpenAI.Codex_26.1016.6573.0_x64`, phiên bản ứng dụng trong `owl-app.ini`: `26.1016.51333`.
- Dùng Windows PowerShell 5.1 và Node có sẵn trong Codex. Nếu bản Codex khác không kèm Node, cần Node.js 22+ trên PATH.
- Tự tìm ứng dụng từ tiến trình đang chạy hoặc gói MSIX; kiểm tra chữ ký OpenAI trước khi dùng runtime.
- Không cần quyền quản trị, không sửa app.asar hoặc thư mục cài đặt, không tạo tác vụ chạy nền thường trú.
- Mở cổng debug ngẫu nhiên; kiểm tra chỉ lắng nghe ở `127.0.0.1`, thuộc đúng PID, đường dẫn chương trình và tài khoản Windows trước khi đưa animation vào cửa sổ chính.
- Nếu Codex đang mở, launcher báo cần thoát và dừng; không tự tắt phiên đang làm việc.

**Cổng debug còn mở trong suốt phiên Codex này.** Tiến trình khác trên máy có thể kết nối vào đó. Muốn kết thúc chế độ này: thoát hẳn Codex và mở lại từ shortcut chính thức. Nút khôi phục giao diện chỉ gỡ trang trí, không đóng cổng debug.

## Tạo shortcut, cập nhật và gỡ bỏ

### Shortcut trên Desktop

Nhấp phải Launch-Windows.cmd → **Show more options / Hiển thị thêm tùy chọn** (nếu có) → **Send to / Gửi tới** → **Desktop (create shortcut)**. Sau đó mở Codex qua shortcut này để có hiệu ứng. Giữ thư mục đã giải nén tại vị trí cố định; di chuyển thư mục sẽ làm shortcut cũ không còn đúng đường dẫn.

### Cập nhật

1. Tải ZIP mới từ Releases và giải nén vào thư mục mới.
2. Lưu công việc, thoát hẳn Codex.
3. Chạy Launch-Windows.cmd của bản mới; cập nhật shortcut nếu cần.
4. Ảnh và chữ đã lưu không nằm trong thư mục launcher nên thường được giữ lại khi dùng cùng hồ sơ Codex. Chữ đã tự lưu không bị bản dịch ghi đè. Sửa riêng các ô chữ nếu muốn giữ ảnh; **Khôi phục mặc định** đặt lại cả ảnh, chữ và độ đậm.

### Khôi phục và gỡ bỏ

- Tạm tắt trang trí: Ctrl+Alt+B → **Tắt hiệu ứng, khôi phục giao diện Codex**.
- Trở lại cách chạy bình thường: thoát hẳn Codex rồi mở biểu tượng chính thức. Bước này cũng kết thúc cổng gỡ lỗi.
- Gỡ launcher: sau khi thoát Codex, xóa shortcut tự tạo và thư mục launcher đã giải nén. Không cần gỡ/cài lại Codex.
- Dữ liệu ảnh/chữ đã lưu trong hồ sơ Codex không bị xóa khi xóa thư mục launcher. Muốn đặt lại nội dung trước khi gỡ, dùng **Khôi phục mặc định → Lưu và xem lại**. Không xóa toàn bộ hồ sơ Codex để gỡ tiện ích.

## Kiểm tra và xử lý lỗi

| Hiện tượng | Cách xử lý |
| --- | --- |
| Báo Codex đang chạy | Lưu công việc, thoát qua menu ứng dụng hoặc biểu tượng khay hệ thống rồi thử lại. Đóng cửa sổ có thể chưa thoát tiến trình. |
| Không thấy animation sau cập nhật | Thoát hẳn Codex; chạy đúng launcher của bản mới. Mở bằng shortcut chính thức không có hiệu ứng. |
| Không tìm thấy ứng dụng | Chạy lệnh -Probe dưới đây; nếu cần, chỉ định đường dẫn tới ChatGPT.exe/Codex.exe của ứng dụng desktop. |
| Báo chữ ký không hợp lệ | Kiểm tra bạn đang dùng Codex chính thức và đúng tệp desktop; không bỏ qua kiểm tra chữ ký. |
| Không tìm thấy Node | Dùng bản Codex có Node đi kèm hoặc cài Node.js 22+ và mở lại terminal. |
| Không tải được ảnh | Giữ đầy đủ thư mục assets; ảnh tùy chỉnh phải là PNG/JPEG/WebP dưới 30 MB. |
| Nút lưu nằm dưới màn hình | Cuộn bên trong bảng cài đặt; giao diện tự điều chỉnh theo kích thước cửa sổ. |
| Phím tắt chưa mở bảng cài đặt | Bấm vào cửa sổ Codex trước, rồi Ctrl+Alt+B; cần khởi động bằng launcher trong phiên đó. |
| Cổng gỡ lỗi/cửa sổ không tương thích | Thoát hẳn rồi mở biểu tượng chính thức; ghi lại thông báo lỗi và phiên bản Codex để kiểm tra tương thích. |


Chạy trong PowerShell tại thư mục đã giải nén:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\windows\Launch.ps1 -Probe
```

Nếu không tự tìm được ứng dụng:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\windows\Launch.ps1 -Executable 'C:\duong-dan\app\ChatGPT.exe'
```

Không trỏ đến `codex.exe` bản CLI. Nếu cổng debug hoặc cấu trúc cửa sổ không còn tương thích sau cập nhật, launcher sẽ báo lỗi. Thoát rồi mở shortcut chính thức để dùng ứng dụng bình thường.

Đã kiểm thử animation hoàn tất, overlay được gỡ, hình nền được giữ, Ctrl+Alt+B mở cài đặt, khôi phục loại bỏ lớp trang trí; kiểm thử này dùng ứng dụng thật với hồ sơ giao diện riêng. Chưa kiểm chứng trên mọi phiên bản Windows/Codex hoặc mọi cấu hình màn hình.

Tải lại trang, mở cửa sổ mới hoặc Codex tự khởi động lại sau cập nhật có thể làm mất trang trí. Launcher không thường trú để gắn lại. Như bản gốc, không bảo đảm mọi chức năng/feature flag giống nhau giữa các cách khởi chạy.

## Phát triển

```powershell
node --test tools/extension.test.mjs tools/windows.test.mjs
node tools/windows-smoke.mjs .build/windows-smoke
powershell.exe -NoProfile -ExecutionPolicy Bypass -File tools/build-windows.ps1
```

Smoke test tạo hồ sơ giao diện thử nghiệm riêng, hiện cửa sổ Codex và đóng cửa sổ đó khi xong; không yêu cầu đăng nhập mới. Backend/tài khoản có thể vẫn được chia sẻ với Codex đã cài. Không chạy kiểm thử nếu không muốn mở thêm cửa sổ. Thư mục `.build` chứa hồ sơ thử và ảnh chụp, không đưa vào gói phát hành.

Mã nguồn Windows được kèm trong `windows/`, `extension/windows.mjs` và `tools/`. Giao diện, animation, ảnh và cơ chế lớp phủ từ repo gốc; xem README.md và docs/references.md để biết nguồn. Repo gốc chưa chỉ định giấy phép mã nguồn; quyền đối với hình ảnh thuộc chủ sở hữu tương ứng. Bản fork không tự cấp lại giấy phép cho nội dung gốc.
