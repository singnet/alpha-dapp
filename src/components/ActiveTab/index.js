import React from "react"
import "./styles.css"

const ActiveTab = ({ tabs, disabled, activeIndex, handleChangeTab }) => (
  <div className = { "activeTab" }>
    {
      tabs.map((tab, index) => (
        [
          <h2
            className={index === activeIndex ? "active" : null}
            key={index}
            onClick={() => !disabled && handleChangeTab(index)}
          >
            { tab }
          </h2>, 
          index !== tabs.length - 1 ? <hr key={index+tab.toString()} /> : null
        ]
      ))
    }
  </div>
)

export default ActiveTab
