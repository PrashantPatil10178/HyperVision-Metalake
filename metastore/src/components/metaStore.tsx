import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const metadata = {
  "format-version": 2,
  "table-uuid": "af796219-8483-4563-8c9a-ebd15733a2fe",
  location: "s3://warehouse/nyc/taxis",
  "last-sequence-number": 2,
  "last-updated-ms": 1741080476731,
  "last-column-id": 5,
  "current-schema-id": 0,
  schemas: [
    {
      type: "struct",
      "schema-id": 0,
      fields: [
        {
          id: 1,
          name: "trip_id",
          required: false,
          type: "long",
        },
        {
          id: 2,
          name: "trip_distance",
          required: false,
          type: "float",
        },
        {
          id: 3,
          name: "fare_amount",
          required: false,
          type: "double",
        },
        {
          id: 4,
          name: "store_and_fwd_flag",
          required: false,
          type: "string",
        },
        {
          id: 5,
          name: "vendor_id",
          required: false,
          type: "long",
        },
      ],
    },
  ],
  "default-spec-id": 0,
  "partition-specs": [
    {
      "spec-id": 0,
      fields: [
        {
          name: "vendor_id",
          transform: "identity",
          "source-id": 5,
          "field-id": 1000,
        },
      ],
    },
  ],
  "last-partition-id": 1000,
  "default-sort-order-id": 0,
  "sort-orders": [
    {
      "order-id": 0,
      fields: [],
    },
  ],
  properties: {
    owner: "root",
    "write.parquet.compression-codec": "zstd",
  },
  "current-snapshot-id": 2342101389725098777,
  refs: {
    main: {
      "snapshot-id": 2342101389725098777,
      type: "branch",
    },
  },
  snapshots: [
    {
      "sequence-number": 1,
      "snapshot-id": 7804764253030103001,
      "timestamp-ms": 1741080476107,
      summary: {
        operation: "overwrite",
        "spark.app.id": "local-1741079891306",
        "added-data-files": "1",
        "added-records": "1",
        "added-files-size": "1453",
        "changed-partition-count": "1",
        "total-records": "1",
        "total-files-size": "1453",
        "total-data-files": "1",
        "total-delete-files": "0",
        "total-position-deletes": "0",
        "total-equality-deletes": "0",
      },
      "manifest-list":
        "s3://warehouse/nyc/taxis/metadata/snap-7804764253030103001-1-53d86905-05d8-400d-ba43-357e1d856c92.avro",
      "schema-id": 0,
    },
    {
      "sequence-number": 2,
      "snapshot-id": 2342101389725098777,
      "parent-snapshot-id": 7804764253030103001,
      "timestamp-ms": 1741080476731,
      summary: {
        operation: "overwrite",
        "spark.app.id": "local-1741079891306",
        "added-data-files": "1",
        "added-records": "2",
        "added-files-size": "1556",
        "changed-partition-count": "1",
        "total-records": "3",
        "total-files-size": "3009",
        "total-data-files": "2",
        "total-delete-files": "0",
        "total-position-deletes": "0",
        "total-equality-deletes": "0",
      },
      "manifest-list":
        "s3://warehouse/nyc/taxis/metadata/snap-2342101389725098777-1-2acc463a-dcb0-48cd-bf0b-d1ffd04d389e.avro",
      "schema-id": 0,
    },
  ],
  statistics: [],
  "partition-statistics": [],
  "snapshot-log": [
    {
      "timestamp-ms": 1741080476107,
      "snapshot-id": 7804764253030103001,
    },
    {
      "timestamp-ms": 1741080476731,
      "snapshot-id": 2342101389725098777,
    },
  ],
  "metadata-log": [
    {
      "timestamp-ms": 1741080039575,
      "metadata-file":
        "s3://warehouse/nyc/taxis/metadata/00000-22a997b9-91da-4123-af72-ba18721bede6.metadata.json",
    },
    {
      "timestamp-ms": 1741080476107,
      "metadata-file":
        "s3://warehouse/nyc/taxis/metadata/00001-0ec6daff-4658-4e73-a3d1-5ef3275fc67f.metadata.json",
    },
  ],
};

const MetaStoreViewer = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Table Info</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            <strong>UUID:</strong> {metadata["table-uuid"]}
          </p>
          <p>
            <strong>Location:</strong> {metadata.location}
          </p>
          <p>
            <strong>Last Updated:</strong>{" "}
            {format(metadata["last-updated-ms"], "PPpp")}
          </p>
        </CardContent>
      </Card>

      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Schema</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Column Name</TableHead>
                <TableHead>Type</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metadata.schemas[0].fields.map((field) => (
                <TableRow key={field.id}>
                  <TableCell>{field.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{field.type}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Partition Details</CardTitle>
        </CardHeader>
        <CardContent>
          {metadata["partition-specs"][0].fields.map((partition) => (
            <p key={partition["field-id"]}>
              <strong>{partition.name}</strong> (Transform:{" "}
              {partition.transform})
            </p>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Table Properties</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.entries(metadata.properties).map(([key, value]) => (
            <p key={key}>
              <strong>{key}:</strong> {value}
            </p>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SnapShots</CardTitle>
        </CardHeader>
        <CardContent>
          {metadata.snapshots.map(() => {
            return <Card></Card>;
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default MetaStoreViewer;
