import React from 'react'
import {
  CBadge,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CDataTable,
  CRow,
  CButton
} from '@coreui/react'
import { DocsLink } from 'src/reusable'

import usersData from '../../users/UsersData'

const getBadge = status => {
  switch (status) {
    case 'Active': return 'success'
    case 'Inactive': return 'secondary'
    case 'Pending': return 'warning'
    case 'Banned': return 'danger'
    default: return 'primary'
  }
}
const fields = ['title', 'company', 'mrp', 'status']

const products = [
  { id: 0, title: 'John Doe', company: '2018/01/01', mrp: 'Guest', status: 'Pending' },
  { id: 1, title: 'Samppa Nori', company: '2018/01/01', mrp: 'Member', status: 'Active' },
  { id: 2, title: 'Estavan Lykos', company: '2018/02/01', mrp: 'Staff', status: 'Banned' },
  { id: 3, title: 'Chetan Mohamed', company: '2018/02/01', mrp: 'Admin', status: 'Inactive' },
  { id: 4, title: 'Derick Maximinus', company: '2018/03/01', mrp: 'Member', status: 'Pending' }
]

const CompanyList = () => {
  return (
    <>
      <CRow>
        <CCol>
          <CCard>
            <CCardHeader>
              Company List
              <div className="card-header-actions">
                  <CButton variant="contained" color="primary" className="card-header-action btn-setting" href="#/companies/new">
                    Add
                  </CButton>
                </div>
            </CCardHeader>
            <CCardBody>
              <CDataTable
                items={products}
                fields={fields}
                hover
                striped
                bordered
                size="sm"
                itemsPerPage={10}
                pagination
                scopedSlots={{
                  'status':
                    (item) => (
                      <td>
                        <CBadge color={getBadge(item.status)}>
                          {item.status}
                        </CBadge>
                      </td>
                    )
                }}
              />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default CompanyList
