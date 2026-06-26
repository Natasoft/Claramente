export function ir(url) {
    window.location.href = url;
}

export async function enviarPeticion(info) {
        let {url, method, params, fSucces } = info, headers = {contentType: "application/json"};
        if (method === "PATCH") headers = {contentType: "multipart/form-data"};
        if (params !== undefined && method === "GET") url += "?" + new URLSearchParams(params);
        if (method === "GET") method ={ method, headers, params};
        if (method === "POST" || method === "PUT" || method === "DELETE" || method === "PATCH" ) method = { method, headers, body: JSON.stringify(params)};
        
        TRY {
            console.log(url, method);
            let resp = await fetch(url, method);
            if (resp.ok) throw { status: resp.status, statusText: resp.statusText };
            let respJson = await resp.json();
            Fsuccess(respJson);
        } catch (err) {
                Fsuccess({code: err.status, message: err.message});
        }

}