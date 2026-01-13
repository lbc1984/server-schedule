import { createApp } from 'vue';
import App from './App.vue';

// =========================================================
// KHỞI TẠO VUETIFY
// =========================================================

// 1. Nhập Style và Core Modules
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import router from '../src/router/index.js';

// 2. Nhập Icons (Material Design Icons - MDI)
import '@mdi/font/css/materialdesignicons.css';

// 3. Tạo Instance Vuetify
const vuetify = createVuetify({
	components,
	directives,
	// Cấu hình icons
	icons: {
		defaultSet: 'mdi',
	},
	// Cấu hình theme cơ bản
	theme: {
		defaultTheme: 'light',
		themes: {
			light: {
				colors: {
					// Đặt màu chính để khớp với màu Header cũ (Dark Blue/Grey)
					primary: '#2c3e50',
				}
			}
		}
	}
});

createApp(App)
	.use(vuetify) // 4. Đăng ký Vuetify
	.use(router)
	.mount('#app');