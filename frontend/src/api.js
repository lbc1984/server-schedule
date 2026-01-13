import axios from 'axios';
import { auth } from './firebase'

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API = axios.create({
	baseURL: BASE_URL,
	timeout: 1000,
	headers: {
		"Content-Type": "application/json"
	}
})

API.interceptors.request.use(
	async (config) => {
		const user = auth.currentUser;

		if (user) {
			const token = await user.getIdToken();
			config.headers.Authorization = `Bearer ${token}`;
		}

		return config;
	},
	(error) => Promise.reject(error)
);

API.interceptors.response.use(
	(response) => response,
	async (error) => {
		if (error.response?.status === 401) {
			if (router.currentRoute.value.name !== "Login") {
				router.push({ name: "Login" });
			}
		}

		return Promise.reject(error);
	}
);

const addSchedule = async (payload, mac) => {
	return await API.post(`/api/schedule/${mac}`, payload);
}

const editSchedule = async (payload, mac, idSchedule) => {
	return await API.put(`/api/schedule/${mac}/${idSchedule}`, payload);
}

const claimDevice = async (mac) => {
	return await API.post("/claim", { mac: mac })
}

const getDevices = async () => {
	return await API.get('/api/devices');
}

const deleteSchedule = async (mac, idSchedule) => {
	return await API.delete(`/api/schedule/${mac}/${idSchedule}`);
}

const actionDevice = async (mac, duration, action) => {
	return await API.post('/api/action', { mac: mac, duration: duration, action: action })
}

const changeNameDevice = async (mac, payload) => {
	await API.put(`/api/name/${mac}`, payload);
}
export { addSchedule, editSchedule, deleteSchedule, claimDevice, getDevices, actionDevice, changeNameDevice }