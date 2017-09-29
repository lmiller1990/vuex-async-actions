A simple library to help reduce boilerplate for doing API calls in Vuex.

### Use

An AJAX request has three state:

1. You make the request - it is `pending`.
2. The request is successful - it is no longer `pending`, and you have some `data`.
3. The request fails - it is not longer `pending`, and you have an error code (and maybe some error message, if you are lucky).

This led my Vuex stores to look something like this:

``` js
state = { 
	isPending: false,
	dataFromService: null,
	serviceStatusCode: null
}

mutations = {
	CALL_PENDING (state, val) { 
		state.isPending = val 
	},

	CALL_SUCCESS (state, payload) { 
		state.dataFromService = payload.response.data; 
		state.serviceStatusCode = payload.response.statusCode
	},

	CALL_FAILURE (state, payload) {
		state.serviceStatusCode = payload.response.statusCode
	}
}

actions = {
	getServiceData (store) {
		// set pending
		store.commit('CALL_PENDING'))

		return axios.get()
			.then((response) => {
				store.commit('CALL_SUCCESS', response)
				store.commit('CALL_PENDING', false)
			}
			.catch((error => {
				store.commit('CALL_FAILURE', response)
				store.commit('CALL_PENDING', false)
			}))
	}
}
```

For _every_ service call I made. This led to a lot of duplication, so I extracted some utility methods, and now this library.

So far there are three methods provided:


