const axios = {}

axios.get = (store, { url, params }, types, callback) => {
	return new Promise((res, rej) => {
		res({ status: 200 })
	})
}

export default axios
