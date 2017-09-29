const axios = {}

axios.get = (store, { url, params }, types, callback) => {
	return new Promise((res, rej) => {
		res({ id: 1 })
	})
}

export default axios
