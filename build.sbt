ThisBuild / scalaVersion := "2.12.18"
ThisBuild / version := "0.1.0"

name := "jalmitra-water-analysis"

libraryDependencies += "org.apache.spark" %% "spark-sql" % "3.5.1" % Provided

Compile / mainClass := Some("WaterAnalysis")