const initialOrgChart = {
  name: "CEO",
  storage: ["ceo-report.pdf", "strategy.docx"],
  children: [
    {
      name: "VP of Marketing",
      storage: ["marketing-plan.xlsx", "ad-campaigns.pptx"],
      children: [
        { name: "Sales Manager", value: 1, storage: ["sales-data.csv", "leads.json"] },
        { name: "PR Manager", value: 1, storage: ["press-release.docx", "media-list.xlsx"] }
      ]
    },
    {
      name: "VP of Engineering",
      storage: ["eng-roadmap.pdf", "tech-stack.txt"],
      children: [
        { name: "Dev Manager", value: 1, storage: ["dev-tasks.md", "code-review.xlsx"] },
        { name: "QA Manager", value: 1, storage: ["qa-checklist.docx", "bug-report.xlsx"] }
      ]
    }
  ]
};

export default initialOrgChart;