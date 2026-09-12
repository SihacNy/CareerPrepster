"use client";

import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { CVData } from "@/types/cv";
import { stripMarkdown } from "@/lib/formatText";

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#0F172A",
  },
  header: {
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#94A3B8",
    paddingBottom: 6,
  },
  fullName: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
    color: "#0F172A",
  },
  contactRow: {
    fontSize: 8.5,
    fontFamily: "Helvetica",
    color: "#475569",
    marginTop: 3,
  },
  section: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    borderBottomWidth: 1,
    borderBottomColor: "#64748B",
    paddingBottom: 1.5,
    marginBottom: 4,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  entryTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
  },
  entryLocation: {
    fontSize: 8,
    color: "#64748B",
  },
  entrySubHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8.5,
    color: "#334155",
    fontStyle: "italic",
    marginBottom: 2,
  },
  bulletList: {
    marginLeft: 8,
    marginTop: 1.5,
  },
  bulletItem: {
    flexDirection: "row",
    marginBottom: 1.5,
  },
  bulletDot: {
    width: 8,
    fontSize: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: 8,
    color: "#334155",
  },
  skillRow: {
    flexDirection: "row",
    marginBottom: 2,
    fontSize: 8,
  },
  skillCategory: {
    fontFamily: "Helvetica-Bold",
    width: 140,
    color: "#0F172A",
  },
  skillText: {
    flex: 1,
    color: "#334155",
  },
});

export function ModernPdfDocument({ data }: { data: CVData }) {
  const { personalInfo, education, experience, projects, skills } = data;

  return (
    <Document title={`${personalInfo.fullName || "Resume"} - Tech CV`}>
      <Page size="A4" style={styles.page}>
        {/* Header - Left Aligned */}
        <View style={styles.header}>
          <Text style={styles.fullName}>{personalInfo.fullName || "Your Full Name"}</Text>
          <Text style={styles.contactRow}>
            {[
              personalInfo.phone,
              personalInfo.email,
              personalInfo.location,
              personalInfo.linkedinUrl,
              personalInfo.githubUrl,
            ]
              .filter(Boolean)
              .join("   |   ")}
          </Text>
        </View>

        {/* Education */}
        {education && education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {education.map((edu) => (
              <View key={edu.id} style={{ marginBottom: 3 }}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{edu.institution}</Text>
                  <Text style={styles.entryLocation}>{edu.location}</Text>
                </View>
                <View style={styles.entrySubHeader}>
                  <Text>
                    {edu.degree}
                    {edu.gpa ? ` (GPA: ${edu.gpa})` : ""}
                  </Text>
                  <Text>
                    {edu.startDate} – {edu.isCurrent ? "Present" : edu.endDate}
                  </Text>
                </View>
                {edu.bulletPoints && edu.bulletPoints.length > 0 && (
                  <View style={styles.bulletList}>
                    {edu.bulletPoints.map((bp, i) => (
                      <View key={i} style={styles.bulletItem}>
                        <Text style={styles.bulletDot}>•</Text>
                        <Text style={styles.bulletText}>{stripMarkdown(bp)}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Experience */}
        {experience && experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {experience.map((exp) => (
              <View key={exp.id} style={{ marginBottom: 4 }}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>{exp.company}</Text>
                  <Text style={styles.entryLocation}>{exp.location}</Text>
                </View>
                <View style={styles.entrySubHeader}>
                  <Text>{exp.role}</Text>
                  <Text>
                    {exp.startDate} – {exp.isCurrent ? "Present" : exp.endDate}
                  </Text>
                </View>
                {exp.bulletPoints && exp.bulletPoints.length > 0 && (
                  <View style={styles.bulletList}>
                    {exp.bulletPoints.map((bp, i) => (
                      <View key={i} style={styles.bulletItem}>
                        <Text style={styles.bulletDot}>•</Text>
                        <Text style={styles.bulletText}>{stripMarkdown(bp)}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Projects */}
        {projects && projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Technical Projects</Text>
            {projects.map((proj) => (
              <View key={proj.id} style={{ marginBottom: 4 }}>
                <View style={styles.entryHeader}>
                  <Text style={styles.entryTitle}>
                    {proj.name}
                    {proj.techStack && proj.techStack.length > 0
                      ? ` | ${proj.techStack.join(", ")}`
                      : ""}
                  </Text>
                  <Text style={styles.entryLocation}>
                    {proj.startDate && proj.endDate ? `${proj.startDate} – ${proj.endDate}` : ""}
                  </Text>
                </View>
                {proj.bulletPoints && proj.bulletPoints.length > 0 && (
                  <View style={styles.bulletList}>
                    {proj.bulletPoints.map((bp, i) => (
                      <View key={i} style={styles.bulletItem}>
                        <Text style={styles.bulletDot}>•</Text>
                        <Text style={styles.bulletText}>{stripMarkdown(bp)}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Technical Skills */}
        {skills && skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Technical Skills</Text>
            {skills
              .filter(
                (cat) =>
                  cat.categoryName &&
                  cat.skills &&
                  cat.skills.some((s) => s.trim().length > 0)
              )
              .map((cat) => (
                <View key={cat.id} style={styles.skillRow}>
                  <Text style={styles.skillCategory}>{cat.categoryName}:</Text>
                  <Text style={styles.skillText}>
                    {cat.skills.filter((s) => s.trim().length > 0).join(", ")}
                  </Text>
                </View>
              ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
