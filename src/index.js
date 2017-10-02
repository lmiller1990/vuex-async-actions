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
					return Vue.set(state, types[type].stateKey, payload.data)
				case types[type].FAILURE:
					return Vue.set(state, types[type].statusCode , payload.status)
			}
		}
	})
}

const fetchAsync = (store, mutationTypes, { url, params }, { responseCb, mutationCb }) => {
	store.commit(mutationTypes.BASE, { type: mutationTypes.PENDING, value: true })

	console.log(responseCb, mutationCb)
	return axios.get(url, { params })
		.then(response => {
			let data = response

			if (responseCb) {
				data = responseCb(response)
				console.log(data)
			}

			if (mutationCb) {
				mutationCb(store.state, data)
			}

			store.commit(mutationTypes.BASE, { 
				type: mutationTypes.SUCCESS, 
				data: data, 
				status: response.status,
				// mutationCb: mutationCb 
			})

			store.commit(mutationTypes.BASE, { 
				type: mutationTypes.PENDING, value: false
			})
		})
		.catch(error => {
			store.commit(mutationTypes.BASE, { type: mutationTypes.PENDING, value: false })
			store.commit(mutationTypes.BASE, { type: mutationTypes.FAILURE }) // statusCode: error.response.status
		})
}

const postAsync = (store, { url, data }, mutationTypes) => {

	return axios.post(url, { data })
		.then(response => {
			console.log(response)

		})
		.catch(error => {
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
	postAsync,
	registerMutations
}
