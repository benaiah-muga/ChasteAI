ALTER TABLE conversations ADD COLUMN is_test boolean NOT NULL DEFAULT false;

ALTER TABLE agents ADD COLUMN knowledge_instructions text;

CREATE TABLE agent_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL,
  document_id uuid NOT NULL,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX agent_documents_agent_document_unique ON agent_documents(agent_id, document_id);
