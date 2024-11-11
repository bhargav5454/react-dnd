import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8001/v1/data",
});

const axiosBaseQuery =
  () =>
  async ({ url, method, data }) => {
    try {
      const response = await api({ url, method, data });
      return { data: response.data };
    } catch (error) {
      console.error(error);
      return {
        error: {
          status: error.response?.status,
          data: error.response?.data || error.message,
        },
      };
    }
  };

export default axiosBaseQuery;
