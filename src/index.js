import camelCase from 'lodash/camelCase'
import axios from 'axios'
import Vue from 'vue'

const registerMutations = (mutations, types) => {
	// if there is only one mutation, put in an array
	if (!Array.isArray(types))
		types = [types]  

	Object.keys(types).forEach(type => {
		mutations[types[type].BASE] = (state, payload) => {
			switch (payload.type) {
				case types[type].PENDING:
					return Vue.set(state, types[type].loadingKey, payload.value)

				case types[type].SUCCESS:
					Vue.set(state, types[type].statusCode, payload.statusCode)
					return Vue.set(state, types[type].stateKey, payload.data)

				case types[type].FAILURE:
					return Vue.set(state, types[type].statusCode , payload.statusCode)
			}
		}
	})
}

const fetchAsync = (store, { url, params }, mutationTypes, callback) => {
	store.commit(mutationTypes.BASE, { type: mutationTypes.PENDING, value: true })

	return axios.get(url, { params })
		.then(response => {
			let data = response

			if (callback) {
				data = callback(response)
			}

			store.commit(mutationTypes.BASE, { type: mutationTypes.SUCCESS, data, statusCode: response.status })
			store.commit(mutationTypes.BASE, { type: mutationTypes.PENDING, value: false})
		})
		.catch(error => {
			store.commit(mutationTypes.BASE, { type: mutationTypes.PENDING, value: false })
			store.commit(mutationTypes.BASE, { type: mutationTypes.FAILURE, statusCode: error.response.status
			})
		})
}

const createMutationSet = (type) => ({
	BASE: `${type}`,
	SUCCESS: `${type}_SUCCESS`,
	FAILURE: `${type}_FAILURE`,
	PENDING: `${type}_PENDING`,
	loadingKey: `${camelCase(type)}Pending`,
	statusCode: `${camelCase(type)}StatusCode`,
	stateKey: `${camelCase(type)}Data`
})

export {
	createMutationSet,
	fetchAsync,
	registerMutations
}
