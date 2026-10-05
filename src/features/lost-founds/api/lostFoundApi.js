import apiHelper from "../../../helpers/apiHelper";

const lostFoundApi = (() => {
  const BASE_URL = `${DELCOM_BASEURL}/lost-founds`;

  function _url(path) {
    return BASE_URL + path;
  }

  async function _parse(response, fallbackMessage) {
    const result = await response.json();
    if (result.status !== "success" && !result.success) {
      throw new Error(result.message || fallbackMessage);
    }
    return result;
  }

  // GET /lost-founds?status=lost|found&is_completed=1|0&is_me=1
  async function getLostFounds({ status = "", isCompleted = "", isMe = false } = {}) {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (isCompleted !== "" && isCompleted !== null && isCompleted !== undefined) {
      params.append("is_completed", String(isCompleted));
    }
    if (isMe) params.append("is_me", "1");

    const query = params.toString();
    const response = await apiHelper.fetchData(_url(query ? `/?${query}` : "/"), {
      method: "GET",
    });

    const result = await _parse(response, "Gagal mengambil data laporan");
    return result.data?.lost_founds || [];
  }

  // GET /lost-founds/:id
  async function getLostFoundById(lostFoundId) {
    const response = await apiHelper.fetchData(_url(`/${lostFoundId}`), {
      method: "GET",
    });

    const result = await _parse(response, "Gagal mengambil detail laporan");
    return result.data?.lost_found;
  }

  // POST /lost-founds
  async function postLostFound(title, description, status) {
    const response = await apiHelper.fetchData(_url("/"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, description, status }),
    });

    const result = await _parse(response, "Gagal menambahkan laporan");
    return result.data;
  }

  // PUT /lost-founds/:id
  async function putLostFound(lostFoundId, title, description, status, isCompleted) {
    const response = await apiHelper.fetchData(_url(`/${lostFoundId}`), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        description,
        status,
        is_completed: isCompleted ? 1 : 0,
      }),
    });

    const result = await _parse(response, "Gagal mengubah laporan");
    return result.message;
  }

  // POST /lost-founds/:id/cover (multipart/form-data)
  async function postLostFoundCover(lostFoundId, cover) {
    const formData = new FormData();
    formData.append("cover", cover, cover.name || "cover.jpg");
    const response = await apiHelper.fetchData(_url(`/${lostFoundId}/cover`), {
      method: "POST",
      body: formData,
    });

    const result = await _parse(response, "Gagal mengubah cover");
    return result.message;
  }

  // DELETE /lost-founds/:id
  async function deleteLostFound(lostFoundId) {
    const response = await apiHelper.fetchData(_url(`/${lostFoundId}`), {
      method: "DELETE",
    });

    const result = await _parse(response, "Gagal menghapus laporan");
    return result.message;
  }

  // GET /lost-founds/stats/daily | monthly  (?end_date=...&total_data=...)
  async function getStats(type = "daily", { endDate = "", totalData = "" } = {}) {
    const params = new URLSearchParams();
    if (endDate) params.append("end_date", endDate);
    if (totalData) params.append("total_data", String(totalData));

    const query = params.toString();
    const response = await apiHelper.fetchData(
      _url(`/stats/${type}${query ? `?${query}` : ""}`),
      { method: "GET" }
    );

    const result = await _parse(response, "Gagal mengambil data statistik");
    return result.data || {};
  }

  return {
    getLostFounds,
    getLostFoundById,
    postLostFound,
    putLostFound,
    postLostFoundCover,
    deleteLostFound,
    getStats,
  };
})();

export default lostFoundApi;
