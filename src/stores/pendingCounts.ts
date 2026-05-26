// stores/pendingCountStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import employeeApi from '../Api/Employee'

const formatDateOnly = (dateString: string | Date) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
}


export const usePendingCountStore = defineStore('pendingCount', () => {
  const pendingCounts = ref({
    leaves: 0,
    overtime: 0,
    attendance: 0,
    travel: 0,
    dayOff: 0,
  })

  const fetchPendingCounts = async (dateFrom: string, dateTo: string, token: string) => {
    try {
      const response = await employeeApi.FetchPendingApprovalCount(
        token,
        formatDateOnly(dateFrom) ?? '',
        formatDateOnly(dateTo) ?? ''
      )

      if (!response.data.success) {
        console.error('Failed to fetch pending counts:', response.data.message)
        return
      }

      const data = response.data.pendingApprovals
      pendingCounts.value = {
        leaves: data.leave ?? 0,
        overtime: data.ot ?? 0,
        attendance: data.attendance ?? 0,
        travel: data.travel ?? 0,
        dayOff: data.changeOff ?? 0,
      }
    } catch (error: unknown) {
      console.error('Error fetching pending counts:', error)
    }
  }

  return { pendingCounts, fetchPendingCounts }
})
