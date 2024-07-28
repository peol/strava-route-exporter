const PAGE_SIZE = 30;

/**
 * Makes an HTTP request using the Fetch API.
 *
 * @param {string} url - The URL to which the request is sent.
 * @param {Object} opts - The options for the fetch request, including method, headers, and body.
 * @returns {Promise<Object>} A promise that resolves to JSON or text-parsed response.
 * @throws {Error} Throws an error if the response is not ok (status is not in the range 200-299).
 *
 * @example
 * const url = 'https://api.example.com/data';
 * const opts = {
 *   method: 'GET',
 *   headers: {
 *     'Authorization': 'Bearer your_token_here'
 *   }
 * };
 * makeFetchRequest(url, opts)
 *   .then(response => {
 *     console.log('Response data:', response);
 *   })
 *   .catch(error => {
 *     console.error('Error:', error);
 *   });
 * 
 * @todo
 * Implement rate-limiting
 */
async function makeFetchRequest(url, opts) {
  //console.log('send req', url, opts);
  const response = await fetch(url, opts);
  //console.log('recv res', response);
  if (!response.ok) {
    console.error('http error', response);
    throw new Error(`HTTP error! status: ${response.status} - ${JSON.stringify(response.body)}`);
  }
  if (response.headers.get('content-type')?.includes('application/json')) {
    return response.json();
  } else {
    return response.text();
  }
}

/**
 * Fetches a new OAuth token using a refresh token.
 *
 * @param {string} client_id - The client ID of the application.
 * @param {string} client_secret - The client secret of the application.
 * @param {string} refresh_token - The refresh token used to obtain a new access token.
 * @returns {Promise<Object>} A promise that resolves to the response from the token endpoint.
 *
 * @example
 * fetchToken('your_client_id', 'your_client_secret', 'your_refresh_token')
 *   .then(response => {
 *     console.log('New token:', response);
 *   })
 *   .catch(error => {
 *     console.error('Error fetching token:', error);
 *   });
 */
async function fetchToken(client_id, client_secret, refresh_token) {
  const opts = {
    method: 'POST',
    body: new URLSearchParams({
      client_id,
      client_secret,
      refresh_token,
      grant_type: 'refresh_token',
    }),
  };
  return makeFetchRequest('https://www.strava.com/oauth/token', opts);
}

/**
 * Makes an authenticated HTTP request to the Strava API.
 *
 * @param {string} token - The bearer token for authentication.
 * @param {string} path - The API endpoint path.
 * @param {Object} opts - The options for the fetch request, including method, headers, and body.
 * @returns {Promise<Object>} A promise that resolves to the JSON-parsed response.
 *
 * @example
 * const token = 'your_bearer_token_here';
 * const path = '/athlete';
 * const opts = {
 *   method: 'GET',
 * };
 * request(token, path, opts)
 *   .then(response => {
 *     console.log('Response data:', response);
 *   })
 *   .catch(error => {
 *     console.error('Error:', error);
 *   });
 */
async function request(token, path, opts) {
  const reqOpts = { ...opts };
  reqOpts.headers = reqOpts.headers ?? {};
  reqOpts.headers.Authorization = `Bearer ${token}`;
  return makeFetchRequest(`https://www.strava.com/api/v3${path}`, reqOpts);
}

/**
 * Fetches all entries from a paginated API endpoint.
 *
 * @param {string} token - The bearer token for authentication.
 * @param {string} path - The API endpoint path without query string.
 * @returns {Promise<Array>} A promise that resolves to an array of all fetched entries.
 *
 * @example
 * const token = 'your_bearer_token_here';
 * const path = '/activities';
 * fetchAllEntries(token, path)
 *   .then(entries => {
 *     console.log('All entries:', entries);
 *   })
 *   .catch(error => {
 *     console.error('Error fetching entries:', error);
 *   });
 */
async function fetchAllEntries(token, path) {
  const entries = [];
  let currentPage = 1;
  let lastResponse;

  while (lastResponse === undefined || lastResponse.length === PAGE_SIZE) {
    const params = new URLSearchParams({
      per_page: PAGE_SIZE,
      page: currentPage++,
    });
    lastResponse = await request(token, `${path}?${params}`);
    entries.push(...lastResponse);
  }
  return entries;
}

export { fetchToken, request, fetchAllEntries };
