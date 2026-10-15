// แก้ไขข้อมูลทั้งหมดของเว็บที่ไฟล์นี้ไฟล์เดียว
window.PORTFOLIO = {
  name: "ชื่อของคุณ",
  title: "Your Role / ตำแหน่งของคุณ",
  bio: "แนะนำตัวสั้นๆ 1-2 ประโยค ว่าทำอะไร สนใจอะไร",
  contacts: [
    { label: "GitHub", url: "https://github.com/anusitsrisawat" },
    { label: "Email", url: "mailto:jimmy18778@gmail.com" }
  ],
  // level: 1-5 (ไม่ใส่ก็ได้)
  skills: [
    {
      name: "JavaScript",
      icon: "🟨",
      level: 4,
      description: "เขียน frontend และ script ทั่วไป",
      projects: [
        { title: "ตัวอย่างโปรเจกต์ 1", url: "https://github.com/", note: "คำอธิบายสั้นๆ" },
        { title: "ตัวอย่างโปรเจกต์ 2", url: "https://github.com/", note: "" }
      ]
    },
    {
      name: "Python",
      icon: "🐍",
      level: 3,
      description: "งาน automation และวิเคราะห์ข้อมูล",
      projects: [
        { title: "ตัวอย่างโปรเจกต์ 3", url: "https://github.com/", note: "" }
      ]
    },
    {
      name: "UI Design",
      icon: "🎨",
      level: 3,
      description: "ออกแบบหน้าจอด้วย Figma",
      projects: [
        { title: "ตัวอย่างงานออกแบบ", url: "https://figma.com/", note: "" }
      ]
    }
  ]
};
