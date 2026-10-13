import org.apache.spark.sql.{DataFrame, SparkSession}
import org.apache.spark.sql.functions._
import org.apache.spark.sql.types._

/**
 * Batch analysis for the JAL MITRA 360 rural water-network CSV dataset.
 *
 * Usage:
 *   spark-submit --class WaterAnalysis --master local[*] \
 *     target/scala-2.12/jalmitra-water-analysis_2.12-0.1.0.jar \
 *     path/to/water_network.csv output
 */
object WaterAnalysis {
  private val inputSchema = StructType(Seq(
    StructField("Record_ID", StringType, nullable = true),
    StructField("Date", StringType, nullable = true),
    StructField("Time", StringType, nullable = true),
    StructField("Village_ID", StringType, nullable = true),
    StructField("Village_Name", StringType, nullable = true),
    StructField("Tank_ID", StringType, nullable = true),
    StructField("Tank_Capacity_Liters", DoubleType, nullable = true),
    StructField("Water_Level_Percentage", DoubleType, nullable = true),
    StructField("Water_Level_Liters", DoubleType, nullable = true),
    StructField("Inlet_Flow_LPM", DoubleType, nullable = true),
    StructField("Outlet_Flow_LPM", DoubleType, nullable = true),
    StructField("Flow_Difference_LPM", DoubleType, nullable = true),
    StructField("Pipeline_Pressure_Bar", DoubleType, nullable = true),
    StructField("Pump_ID", StringType, nullable = true),
    StructField("Pump_Status", StringType, nullable = true),
    StructField("Pump_Runtime_Minutes", DoubleType, nullable = true),
    StructField("Power_Consumption_kWh", DoubleType, nullable = true),
    StructField("Water_Demand_Liters", DoubleType, nullable = true),
    StructField("Water_Supplied_Liters", DoubleType, nullable = true),
    StructField("Water_Wastage_Liters", DoubleType, nullable = true),
    StructField("Leakage_Status", StringType, nullable = true),
    StructField("Leakage_Risk_Percentage", DoubleType, nullable = true),
    StructField("Sensor_Status", StringType, nullable = true),
    StructField("Water_Quality_Status", StringType, nullable = true),
    StructField("Supply_Status", StringType, nullable = true),
    StructField("Temperature_C", DoubleType, nullable = true),
    StructField("Rainfall_mm", DoubleType, nullable = true),
    StructField("Maintenance_Status", StringType, nullable = true),
    StructField("Alert_Level", StringType, nullable = true),
    StructField("Complaint_Count", IntegerType, nullable = true)
  ))

  private val textColumns = Set(
    "Record_ID", "Date", "Time", "Village_ID", "Village_Name", "Tank_ID",
    "Pump_ID", "Pump_Status", "Leakage_Status", "Sensor_Status",
    "Water_Quality_Status", "Supply_Status", "Maintenance_Status", "Alert_Level"
  )

  def main(args: Array[String]): Unit = {
    require(args.length >= 1, "Usage: WaterAnalysis <input.csv> [output-directory]")
    val inputPath = args(0)
    val outputDirectory = if (args.length >= 2) args(1) else "output"

    val spark = SparkSession.builder()
      .appName("JAL MITRA 360 Water Network Analysis")
      .getOrCreate()

    try {
      spark.sparkContext.setLogLevel("WARN")
      println("=" * 78)
      println("JAL MITRA 360 | Apache Spark + Scala Water Network Analysis")
      println("=" * 78)

      // CSV loading: schema makes numeric columns usable in aggregations immediately.
      val rawData = spark.read
        .format("csv")
        .option("header", "true")
        .option("mode", "PERMISSIVE")
        .option("enforceSchema", "false")
        .option("ignoreLeadingWhiteSpace", "true")
        .option("ignoreTrailingWhiteSpace", "true")
        .schema(inputSchema)
        .load(inputPath)

      println("\n--- Input schema ---")
      rawData.printSchema()
      println(s"Input record count: ${rawData.count()}")
      println("First five input records:")
      rawData.show(5, truncate = false)

      // Cleaning transformations: trim text, remove unusable IDs, de-duplicate records,
      // and reject physically impossible negative measurements while retaining nulls.
      val trimmedData = textColumns.foldLeft(rawData) { (dataFrame, columnName) =>
        dataFrame.withColumn(columnName, trim(col(columnName)))
      }

      val cleanedData = trimmedData
        .filter(
          col("Record_ID").isNotNull && length(col("Record_ID")) > 0 &&
            col("Village_ID").isNotNull && length(col("Village_ID")) > 0
        )
        .dropDuplicates("Record_ID")
        .filter(
          (col("Tank_Capacity_Liters").isNull || col("Tank_Capacity_Liters") >= 0) &&
            (col("Water_Level_Liters").isNull || col("Water_Level_Liters") >= 0) &&
            (col("Inlet_Flow_LPM").isNull || col("Inlet_Flow_LPM") >= 0) &&
            (col("Outlet_Flow_LPM").isNull || col("Outlet_Flow_LPM") >= 0) &&
            (col("Water_Demand_Liters").isNull || col("Water_Demand_Liters") >= 0) &&
            (col("Water_Supplied_Liters").isNull || col("Water_Supplied_Liters") >= 0) &&
            (col("Water_Wastage_Liters").isNull || col("Water_Wastage_Liters") >= 0) &&
            (col("Complaint_Count").isNull || col("Complaint_Count") >= 0)
        )

      // Feature engineering transformations used by multiple analyses.
      val processedData = cleanedData
        .withColumn(
          "Calculated_Flow_Difference_LPM",
          round(col("Inlet_Flow_LPM") - col("Outlet_Flow_LPM"), 2)
        )
        .withColumn(
          "Supply_Efficiency_Percentage",
          when(col("Water_Demand_Liters") > 0,
            round(col("Water_Supplied_Liters") / col("Water_Demand_Liters") * 100, 2)
          )
        )
        .withColumn(
          "Leakage_Risk_Band",
          when(col("Leakage_Risk_Percentage") >= 75, "HIGH")
            .when(col("Leakage_Risk_Percentage") >= 40, "MEDIUM")
            .when(col("Leakage_Risk_Percentage").isNotNull, "LOW")
            .otherwise("UNKNOWN")
        )

      // Cache is useful because each summary reads the same cleaned DataFrame.
      processedData.cache()
      println("\n--- Cleaned data ---")
      processedData.printSchema()
      println(s"Cleaned record count: ${processedData.count()}")
      println("Sample calculated columns:")
      processedData.select(
        "Record_ID", "Village_Name", "Tank_ID", "Calculated_Flow_Difference_LPM",
        "Supply_Efficiency_Percentage", "Leakage_Risk_Band"
      ).show(10, truncate = false)

      // A. Village-wise average water level.
      val villageAverageWaterLevel = processedData
        .groupBy("Village_ID", "Village_Name")
        .agg(
          round(avg("Water_Level_Percentage"), 2).as("Average_Water_Level_Percentage"),
          round(avg("Water_Level_Liters"), 2).as("Average_Water_Level_Liters"),
          count(lit(1)).as("Record_Count")
        )
        .orderBy(desc("Average_Water_Level_Percentage"))

      // B. Village-wise inlet and outlet flow averages.
      val villageAverageFlow = processedData
        .groupBy("Village_ID", "Village_Name")
        .agg(
          round(avg("Inlet_Flow_LPM"), 2).as("Average_Inlet_Flow_LPM"),
          round(avg("Outlet_Flow_LPM"), 2).as("Average_Outlet_Flow_LPM"),
          round(avg("Calculated_Flow_Difference_LPM"), 2).as("Average_Flow_Difference_LPM")
        )
        .orderBy(desc("Average_Inlet_Flow_LPM"))

      // C. Tank-wise usage totals for the period represented by the input file.
      val tankWaterUsage = processedData
        .groupBy("Village_ID", "Village_Name", "Tank_ID")
        .agg(
          round(sum("Water_Demand_Liters"), 2).as("Total_Demand_Liters"),
          round(sum("Water_Supplied_Liters"), 2).as("Total_Supplied_Liters"),
          round(sum("Water_Wastage_Liters"), 2).as("Total_Wastage_Liters"),
          round(avg("Water_Level_Percentage"), 2).as("Average_Level_Percentage")
        )
        .orderBy(desc("Total_Supplied_Liters"))

      // D. A record is included if leakage is reported or its risk score is at least 60%.
      val leakageRiskRecords = processedData
        .filter(
          lower(coalesce(col("Leakage_Status"), lit("")))
            .isin("leak", "leakage", "detected", "yes", "true", "active") ||
            col("Leakage_Risk_Percentage") >= 60
        )
        .select(
          "Record_ID", "Date", "Time", "Village_ID", "Village_Name", "Tank_ID",
          "Flow_Difference_LPM", "Pipeline_Pressure_Bar", "Leakage_Status",
          "Leakage_Risk_Percentage", "Leakage_Risk_Band", "Alert_Level"
        )
        .orderBy(desc("Leakage_Risk_Percentage"))

      // E. Abnormal status values and physically out-of-range sensor values are flagged.
      val abnormalSensorRecords = processedData
        .withColumn(
          "Abnormal_Reason",
          when(lower(coalesce(col("Sensor_Status"), lit("")))
            .isin("warning", "critical", "offline", "fault", "contaminated", "error"),
            concat(lit("Sensor status: "), coalesce(col("Sensor_Status"), lit("unknown")))
          )
            .when(col("Water_Level_Percentage") < 0 || col("Water_Level_Percentage") > 100,
              lit("Water level percentage is outside 0-100")
            )
            .when(col("Pipeline_Pressure_Bar") < 0, lit("Pipeline pressure is negative"))
            .when(col("Inlet_Flow_LPM") < 0 || col("Outlet_Flow_LPM") < 0,
              lit("Flow reading is negative")
            )
        )
        .filter(col("Abnormal_Reason").isNotNull)
        .select(
          "Record_ID", "Date", "Time", "Village_ID", "Village_Name", "Tank_ID",
          "Sensor_Status", "Water_Level_Percentage", "Inlet_Flow_LPM",
          "Outlet_Flow_LPM", "Pipeline_Pressure_Bar", "Abnormal_Reason", "Alert_Level"
        )
        .orderBy("Village_Name", "Date", "Time")

      // F. Pump status and operating averages.
      val pumpStatusSummary = processedData
        .groupBy("Village_ID", "Village_Name", "Pump_ID", "Pump_Status")
        .agg(
          count(lit(1)).as("Record_Count"),
          round(avg("Pump_Runtime_Minutes"), 2).as("Average_Runtime_Minutes"),
          round(sum("Power_Consumption_kWh"), 2).as("Total_Power_Consumption_kWh")
        )
        .orderBy("Village_Name", "Pump_ID", "Pump_Status")

      // G. Village water wastage.
      val villageWaterWastage = processedData
        .groupBy("Village_ID", "Village_Name")
        .agg(
          round(sum("Water_Wastage_Liters"), 2).as("Total_Wastage_Liters"),
          round(avg("Water_Wastage_Liters"), 2).as("Average_Wastage_Per_Record_Liters"),
          count(lit(1)).as("Record_Count")
        )
        .orderBy(desc("Total_Wastage_Liters"))

      // H. Complaint count totals by village for the input period.
      val villageComplaintSummary = processedData
        .groupBy("Village_ID", "Village_Name")
        .agg(
          sum(coalesce(col("Complaint_Count"), lit(0))).as("Total_Complaints"),
          round(avg("Complaint_Count"), 2).as("Average_Complaints_Per_Record"),
          count(lit(1)).as("Record_Count")
        )
        .orderBy(desc("Total_Complaints"))

      // I. One-row network summary for a dashboard KPI/API endpoint.
      val overallWaterSupplySummary = processedData.agg(
        countDistinct("Record_ID").as("Unique_Record_Count"),
        countDistinct("Village_ID").as("Village_Count"),
        countDistinct("Tank_ID").as("Tank_Count"),
        round(sum("Water_Demand_Liters"), 2).as("Total_Demand_Liters"),
        round(sum("Water_Supplied_Liters"), 2).as("Total_Supplied_Liters"),
        round(sum("Water_Wastage_Liters"), 2).as("Total_Wastage_Liters"),
        round(avg("Water_Level_Percentage"), 2).as("Network_Average_Water_Level_Percentage"),
        round(avg("Leakage_Risk_Percentage"), 2).as("Average_Leakage_Risk_Percentage"),
        sum(when(col("Supply_Status") === "ACTIVE", 1).otherwise(0)).as("Active_Supply_Record_Count"),
        sum(when(lower(coalesce(col("Leakage_Status"), lit("")))
          .isin("leak", "leakage", "detected", "yes", "true", "active"), 1)
          .otherwise(0)).as("Reported_Leakage_Record_Count")
      )

      val summaries: Seq[(String, DataFrame)] = Seq(
        "A. Village-wise average water level" -> villageAverageWaterLevel,
        "B. Village-wise average inlet and outlet flow" -> villageAverageFlow,
        "C. Tank-wise water usage" -> tankWaterUsage,
        "D. Leakage-risk records (risk >= 60% or leakage reported)" -> leakageRiskRecords,
        "E. Abnormal sensor readings" -> abnormalSensorRecords,
        "F. Pump status summary" -> pumpStatusSummary,
        "G. Water wastage by village" -> villageWaterWastage,
        "H. Complaint count by village" -> villageComplaintSummary,
        "I. Overall water supply summary" -> overallWaterSupplySummary
      )

      summaries.foreach { case (title, result) =>
        println(s"\n--- $title (${result.count()} rows) ---")
        result.show(30, truncate = false)
      }

      // Each CSV path is a Spark output directory containing one or more part files.
      val outputNames = Seq(
        "village_average_water_level",
        "village_average_flow",
        "tank_water_usage",
        "leakage_risk_records",
        "abnormal_sensor_readings",
        "pump_status_summary",
        "village_water_wastage",
        "village_complaint_summary",
        "overall_water_supply_summary"
      )

      summaries.zip(outputNames).foreach { case ((_, result), folderName) =>
        result.write
          .mode("overwrite")
          .option("header", "true")
          .option("emptyValue", "")
          .csv(s"$outputDirectory/$folderName")
        println(s"Saved: $outputDirectory/$folderName")

        // JSON Lines output is consumed by the Express API for the React website.
        result.write
          .mode("overwrite")
          .json(s"$outputDirectory/api/$folderName")
        println(s"Saved website API data: $outputDirectory/api/$folderName")
      }

      println(s"\nAnalysis complete. CSV summary directories are under: $outputDirectory")
    } finally {
      spark.stop()
    }
  }
}