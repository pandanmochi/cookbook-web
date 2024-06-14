/*
 * Sends an asynchronous HTTP request, and returns a promise that resolves into an HTTP
 * response body. The promise is rejected if there is a network I/O problem, or if the
 * response's status is out of the [200,299] success range; the resulting exception
 * carries the (raw) HTTP response headers in an additional "headers" property.
 * Copyright (c) 2016 Sascha Baumeister
 * @param resource {String} the service URI
 * @param method {String} the optional service method, with default "GET"
 * @param headers {Object} the optional request headers map, with default empty map
 * @param requestBody {Object} the optional request body, with default null
 * @param responseType {String} the optional response type, one of "text" (the default), "arraybuffer", "blob", "document", "json" 
 * @param alias {String} an optional user alias, with default null
 * @param password {String} an optional user password, with default null
 * @return {Promise} the promise of an unmarshaled response body object
 * @throws {ReferenceError} if the given resource, method, headers, or responseType is null
 * @throws {TypeError} if the given resource, method, responseType, alias or password is not a string,
 *						or if the given headers value is not an object
 * @throws {Error} if HTTP authentication fails
 */
 export default function xhr (resource, method = "GET", headers = {}, requestBody = null, responseType = "text", alias = null, password = null) {
	if (resource == null || method == null || headers == null || responseType == null) throw new ReferenceError();
	if (typeof resource !== "string" || typeof method !== "string" || typeof headers !== "object" || typeof responseType !== "string") throw new TypeError();
	if ((alias != null && typeof alias !== "string") || (password != null && typeof password !== "string")) throw new TypeError();
	if (!alias || !password) alias = password = null;

	const exchange = new XMLHttpRequest();
	exchange.responseType = responseType;
	exchange.withCredentials = true;
	exchange.open(method, resource, true, alias, password);

	for (const key in headers)
		exchange.setRequestHeader(key, headers[key]);

	return new Promise((resolve, reject) => {
		const errorEventHandler = event => reject(new Error("HTTP exchange failed!"));
		const loadEventHandler = event => {
			if (event.currentTarget.status >= 200 && event.currentTarget.status <= 299) {
				resolve(event.currentTarget.response);
			} else {
				const error = new Error("HTTP " + event.currentTarget.status + " " + event.currentTarget.statusText);
				error.headers = event.currentTarget.getAllResponseHeaders();
				reject(error);
			}
		};

		exchange.addEventListener("error", errorEventHandler);
		exchange.addEventListener("load", loadEventHandler);
		exchange.send(requestBody);
	});
}