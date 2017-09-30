A simple library to help reduce boilerplate for doing API calls in Vuex.

### Use

An AJAX request has three state:

1. You make the request - it is `pending`.
2. The request is successful - it is no longer `pending`, and you have some `data`.
3. The request fails - it is not longer `pending`, and you have an error code (and maybe some error message, if you are lucky).

This led my Vuex stores to look something like this:

``` js
const state = { 
  isPending: false,
  dataFromService: null,
  serviceStatusCode: null
}

const mutations = { 
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

const actions = {
  getServiceData (store) {
    // set pending
    store.commit('CALL_PENDING'))

    return axios.get()
      .then((response) => {
				store.commit('CALL_SUCCESS', response)
				store.commit('CALL_PENDING', false)
			})
      .catch((error => {
        store.commit('CALL_FAILURE', response)
        store.commit('CALL_PENDING', false)
      }))
    }
  }
```

For _every_ service call I made. This led to a lot of duplication. I'd end up with stuff like `getTasksPending`, `getProjectsPending`, `SET_TASKS`, `SET_PROJECTS`, which all basically did the same thing. So, I extracted some utility methods, and now this library.

So far there are three methods provided: `createMutationSet`, `fetchAsync`, and `registerMutations`.

### `createMutationSet(type)`
Creates a `mutationSet`. 

#### Arguments
1. `type` _(String)_: the type to use for the mutation.

For example `createMutationSet('GET_INFO_ASYNC')` would return the following:

``` js
  GET_INFO_ASYNC = {
  BASE: 'GET_INFO_ASYNC',
  SUCCESS: 'GET_INFO_ASYNC_SUCCESS',
  PENDING: 'GET_INFO_ASYNC_PENDING',
  FAILURE:    'GET_INFO_ASYNC_FAILURE',
  pendingKey: 'getInfoAsyncPending',
  statusCode: 'getInfoAsyncErrorCode',
  dataKey:    'getInfoAsyncData'
}
```

`BASE` is the mutation that will initially be committed to. It handles the three states of an async call, as well as sets up a state properties for whether the call is `pending`, the `statusCode` and the actual `data`. They are named after the mutation, but camelCased. Conventions are good.

### `registerMutations(mutations, [mutationSets])`
Registers any `mutationSets` to your Vuex store.

#### Arguments
1. `mutations` _(Object)_: the mutations object that will eventually be passed to the Vuex store. It may contain other mutations.
2. `mutationSets` _(Object, Array)_: Either a single `mutationSet`, or an Array of `mutationSets` created using `createMutationSet`.

Example:

``` js
const getData = createMutationSet('GET_DATA')
const mutations = {}

registerMutations(mutations, getData)
	```

	Will register the follow mutation:
	```
	GET_DATA (state, payload) => {
		switch (payload.type) {
			case GET_DATA_PENDING:
				return Vue.set(state, types[type].loadingKey, payload.value)
			case GET_DATA_SUCCESS: 
					Vue.set(state, getInfoAsyncStatusCode, payload.statusCode)
						return Vue.set(state, getInfoAsyncData, payload.data)
			case GET_DATA_FAILURE:
						return Vue.set(state, 
								getInfoAsyncStatusCode, 
								payload.statusCode)
		}
	}
}
```

### `fetchAsync(store, { url, params }, mutationSet, callback)`
Does the async call, and handles and state changes.

#### Arguments
1. `store` _(Object)_: The Vuex store. It is required.
2. `options` _(Object)_: An object containing at least the `url` for the request. You can also pass some `params`.
3. `mutationSet` _(Object)_: The `mutationSet` to use, created by `createMutationSet`.
4. `callback` _(Function)_: A function to be called on the response, if the response is successful. Useful for processing data before it is written to the store. It should receive the response as the first argument.

Example:

```
const getPost = createMutationSet('GET_POST')
const mutations = {}

registerMutations(mutations, getPost)

// callback to call on success. Just get the first post, for example.
getFirstPost = (response) => response.data.posts[0]

const apiUrl = 'https://jsonplaceholder.typicode.com/posts'

const actions = {
	getPostsFromApi: (store, payload) => fetchAsync(store, { url: apiUrl }, getPost, getFirstPost)
}
```

Now doing `$store.dispatch('getPostsFromApi')` will execute the following:

Set `getPostPending` to `true`.
Make the API call.
If successful, get `getPostPending` to `false`, call `getFirstPost(response)`, and commit the result to the state using the property `getPostData`. It will also set `getPostStatusCode` (such as 200 for success, 201 for created, etc).
If unsuccessful, set `getPostPending` to `false`, and commit the status code (for example 404) to `getPostStatusCode`.

