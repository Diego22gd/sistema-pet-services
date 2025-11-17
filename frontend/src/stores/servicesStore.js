import { defineStore } from "pinia";
import * as serviceAPI from "@/api/services";

export const useServicesStore = defineStore("services", {
  state: () => ({
    services: [],
    pendingServices: [],
    myServices: [],
  }),
  actions: {
    async fetchServices() {
      this.services = await serviceAPI.getServices();
    },
    async fetchPending() {
      this.pendingServices = await serviceAPI.getPendingServices();
    },
    async fetchMyServices() {
      this.myServices = await serviceAPI.getMyServices();
    },
    async addService(data) {
      const res = await serviceAPI.createService(data);
      this.services.push(res.service);
    },
    async editService(id, data) {
      const res = await serviceAPI.updateService(id, data);
      const index = this.services.findIndex(s => s.id === id);
      if (index !== -1) this.services[index] = res.service;
    },
    async removeService(id) {
      await serviceAPI.deleteService(id);
      this.services = this.services.filter(s => s.id !== id);
    },
    async approve(id) {
      const res = await serviceAPI.approveService(id);
      const index = this.pendingServices.findIndex(s => s.id === id);
      if (index !== -1) this.pendingServices.splice(index, 1);
      this.services.push(res.service);
    },
  },
});
